import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import { toast } from 'sonner';
import TurndownService from 'turndown';
import { useNavigate } from 'react-router-dom';
import ProblemStatementSection from '@/components/admin/problems/ProblemStatementSection';
import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import PreviewProblem from '@/components/admin/problems/PreviewProblem';
import { createProblem, uploadTestCase, updateProblem } from '@/services/problemService';
import UploadTestcases from '@/components/admin/problems/UploadTestcases';
import MarkdownIt from "markdown-it";
import mathjax3 from "markdown-it-mathjax3";

const DIFFICULTY_OPTIONS = [
  { value: 'Easy', label: 'Easy', color: 'bg-green-100 text-green-700' },
  { value: 'Medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'Hard', label: 'Hard', color: 'bg-red-100 text-red-700' }
];

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  fence: '```',
  emDelimiter: '_',
  strongDelimiter: '**',
  linkStyle: 'inlined'
});

function renderMd(content) {
  const md = new MarkdownIt().use(mathjax3);
  return md.render(content || '');
}

const ProblemForm = ({ 
  initialData = null, 
  mode = 'create',
  onProblemCreated = null,
  isInContestMode = false
}) => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [createdProblemId, setCreatedProblemId] = useState(null);
  console.log("Init: ", initialData)
  const [formData, setFormData] = useState({
    name: '',
    statement: '',
    input: '',
    output: '',
    tags: [],
    time: 1,
    memory: 512,
    difficulty: 'Easy',
    rating: 100,
    img: [],
    isPrivate: false,
    isPdf: false,
    examplesInput: [],
    examplesOutput: []
  });
  
  const formDataRef = useRef({
    name: '',
    statement: '',
    input: '',
    output: '',
    tags: [],
    time: 1,
    memory: 512,
    difficulty: 'Easy',
    rating: 100,
    img: [],
    isPrivate: false,
    isPdf: false,
    examplesInput: [],
    examplesOutput: []
  });
  const stepperRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData(initialData);
      const copyData = { ...initialData };
      copyData.statement = renderMd(initialData.statement?.replace(/\\n/g, '\n') || '');
      copyData.input = renderMd(initialData.input?.replace(/\\n/g, '\n') || '');
      copyData.output = renderMd(initialData.output?.replace(/\\n/g, '\n') || '');
      formDataRef.current = copyData;
      setIsLoading(false);
    }
    else if (mode == 'create'){
      setIsLoading(false);
    }
  }, [initialData, mode]);

  const handleFormDataChange = useCallback((field, value) => {
    const newValue =
      typeof value === "string" ? turndownService.turndown(value) : value;

    setFormData((prev) => {
      const updated = { ...prev, [field]: newValue };
      
      if (field === 'difficulty') {
        let estimatedRating = 200;
        if (newValue === 'Medium') estimatedRating = 500;
        else if (newValue === 'Hard') estimatedRating = 800;
        updated.rating = estimatedRating;
      }

      if (mode == 'edit'){
        formDataRef.current = {
          ...formDataRef.current,
          [field]: value
        };
        if (field === 'difficulty') {
          formDataRef.current.rating = updated.rating;
        }
      }
      else {
        formDataRef.current = {
          ...prev,
          [field]: value
        };
        if (field === 'difficulty') {
          formDataRef.current.rating = updated.rating;
        }
      }
      return updated;
    });
  }, [mode]);

  const handleAddExample = useCallback(() => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        examplesInput: [...prev.examplesInput, ''],
        examplesOutput: [...prev.examplesOutput, '']
      };
      if (!formDataRef.current) {
        formDataRef.current = { ...updated };
      } else {
        formDataRef.current.examplesInput = updated.examplesInput;
        formDataRef.current.examplesOutput = updated.examplesOutput;
      }
      return updated;
    });
  }, []);

  const handleRemoveExample = useCallback((index) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        examplesInput: prev.examplesInput.filter((_, i) => i !== index),
        examplesOutput: prev.examplesOutput.filter((_, i) => i !== index)
      };
      if (!formDataRef.current) {
        formDataRef.current = { ...updated };
      } else {
        formDataRef.current.examplesInput = updated.examplesInput;
        formDataRef.current.examplesOutput = updated.examplesOutput;
      }
      return updated;
    });
  }, []);

  const handleExampleChange = useCallback((index, type, value) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [type === 'input' ? 'examplesInput' : 'examplesOutput']:
          prev[type === 'input' ? 'examplesInput' : 'examplesOutput'].map((item, i) =>
            i === index ? value : item
          )
      };
      if (!formDataRef.current) {
        formDataRef.current = { ...updated };
      } else {
        formDataRef.current.examplesInput = updated.examplesInput;
        formDataRef.current.examplesOutput = updated.examplesOutput;
      }
      return updated;
    });
  }, []);

  const validateStatementSection = () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên bài tập');
      return false;
    }
    if (!formData.statement.trim()) {
      toast.error('Vui lòng nhập đề bài');
      return false;
    }
    if (!formData.input.trim()) {
      toast.error('Vui lòng nhập mô tả input');
      return false;
    }
    if (!formData.output.trim()) {
      toast.error('Vui lòng nhập mô tả output');
      return false;
    }
    if (formData.tags.length === 0) {
      toast.error('Vui lòng thêm ít nhất 1 tag');
      return false;
    }
    if (formData.time < 0.1 || formData.time > 10) {
      toast.error('Time limit phải từ 0.1 đến 10 giây');
      return false;
    }
    if (formData.memory < 128 || formData.memory > 2048) {
      toast.error('Memory limit phải từ 128 đến 2048 MB');
      return false;
    }
    return true;
  };

  const handleCancel = () => {
    if (isInContestMode) {
      onProblemCreated?.(null);
    } else {
      if (window.confirm('Bạn có chắc muốn hủy? Mọi thay đổi sẽ không được lưu.')) {
        navigate('/problems');
      }
    }
  };

  // Creates the problem if it doesn't exist yet (for AI test case generation)
  const handleEnsureProblemCreated = async () => {
    // Edit mode: problem already exists
    if (mode === 'edit' && initialData?._id) {
      return initialData._id;
    }

    // Already created via a previous AI tab switch
    if (createdProblemId) {
      return createdProblemId;
    }

    // Create mode: create the problem now
    if (!validateStatementSection()) {
      throw new Error("Validation failed");
    }

    try {
      const response = await createProblem(formData);
      const newId = response.data._id;
      setCreatedProblemId(newId);
      toast.success('Đã tạo bài tập để liên kết với AI Testcase');
      return newId;
    } catch (error) {
      toast.error('Không thể tạo bài tập. Vui lòng kiểm tra lại thông tin.');
      throw error;
    }
  };

  const handleUploadTest = async (file) => {
    if (!validateStatementSection()) {
      return;
    }

    const ratingVal = Number(formData.rating || 100);
    if (isNaN(ratingVal) || ratingVal < 100 || ratingVal > 1000) {
      toast.error('Rating must be an integer between 100 and 1000');
      return;
    }

    setIsUploading(true);
  
    try {
      let createdProblem = null;
      let problemIdToUse = createdProblemId;

      const actionPromise = mode === 'create'
        ? (async () => {
            if (problemIdToUse) {
              // Problem already created via AI tab; update it and upload test cases
              await updateProblem(problemIdToUse, formData);
              if (file != null) {
                await uploadTestCase(problemIdToUse, file);
              }
            } else {
              const response = await createProblem(formData);
              const id = response.data._id;
              createdProblem = response.data;
              problemIdToUse = id;
              if (file != null) {
                await uploadTestCase(id, file);
              }
            }
          })()
        : (async () => {
            await updateProblem(initialData._id, formData);
            if (file != null) {
              await uploadTestCase(initialData._id, file);
            }
          })();
  
      toast.promise(
        actionPromise,
        {
          loading: mode === 'create' 
            ? 'Đang tạo bài tập...'
            : 'Đang cập nhật bài tập...',
          success: mode === 'create' 
            ? 'Tạo bài tập thành công'
            : 'Cập nhật bài tập thành công',
          error: mode === 'create'
            ? 'Không thể tạo bài tập'
            : 'Không thể cập nhật bài tập',
        }
      );
  
      await actionPromise;
      setIsUploading(false);
      
      if (isInContestMode && mode === 'create' && createdProblem) {
        onProblemCreated?.(createdProblem);
      } else {
        navigate('/problems');
      }
      
    } catch (err) {
      console.log(`${mode === 'create' ? 'Create' : 'Update'} problem error:`, err);
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={isInContestMode ? 'space-y-6 text-slate-800 dark:text-slate-100' : 'min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800/60 dark:to-slate-900 p-8 space-y-6 max-w-full mx-auto text-slate-800 dark:text-slate-100'}>
      {/*  Only show header when NOT in contest mode */}
      {!isInContestMode && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleCancel}
                className="text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                disabled={isUploading}
              >
                <ArrowLeft className="h-5 w-5 mr-2 text-slate-700 dark:text-white" />
                Quay lại
              </Button>
            </div>
          </div>
          
          <div className='flex items-center justify-center'>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              {mode === 'create' ? 'Tạo bài tập mới' : 'Cập nhật bài tập'}
            </h2>
          </div>
        </>
      )}
      
      {/*  Show title in contest mode */}
      {isInContestMode && (
        <div className='flex items-center justify-center'>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {mode === 'create' ? 'Tạo bài tập mới cho kỳ thi' : 'Cập nhật bài tập'}
          </h2>
        </div>
      )}
      
      <Card className={'pt-10 px-6 pb-6 border border-slate-100 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-800 rounded-2xl'}>
        <div className={isUploading ? 'pointer-events-none opacity-50' : ''}>
          <Stepper ref={stepperRef} style={{ flexBasis: '50rem' }}>
            <StepperPanel header="Thông tin">
              <div className="flex flex-col h-full">
                <ProblemStatementSection
                  formData={formDataRef.current || formData}
                  onFormDataChange={handleFormDataChange}
                  onAddExample={handleAddExample}
                  onRemoveExample={handleRemoveExample}
                  onExampleChange={handleExampleChange}
                  difficultyOptions={DIFFICULTY_OPTIONS}
                />
              </div>
              <div className="flex pt-6 justify-end">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md font-bold px-6 py-2.5 transition-all duration-200 border-0" onClick={() => stepperRef.current.nextCallback()}>
                  Tiếp tục
                </Button>
              </div>
            </StepperPanel>
            
            <StepperPanel header="Xem trước">
              <div className="flex flex-column h-full">
                <PreviewProblem problem={formData}/>
              </div>
              <div className="flex pt-6 justify-between gap-4">
                <Button variant="outline" className="border-slate-200 dark:border-slate-700 dark:text-slate-300 rounded-xl font-bold px-6 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-850" onClick={() => stepperRef.current.prevCallback()}>
                  Quay lại
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md font-bold px-6 py-2.5 transition-all duration-200 border-0" onClick={() => stepperRef.current.nextCallback()}>
                  Tiếp tục
                </Button>
              </div>
            </StepperPanel>
            
            <StepperPanel header="Test cases">
              <div className="flex flex-column h-full">
                <UploadTestcases 
                  onHandleUpload={handleUploadTest}
                  isUpdate={mode === 'edit'}
                  zipName={initialData?.zipName}
                  problemId={mode === 'edit' ? initialData?._id : createdProblemId}
                  workflowId={mode === 'edit' ? initialData?.testCasePlanId : null}
                  onEnsureProblemCreated={handleEnsureProblemCreated}
                  initialPlanData={formData}
                />
              </div>
              <div className="flex pt-6 justify-between gap-4">
                <Button variant="outline" className="border-slate-200 dark:border-slate-700 dark:text-slate-300 rounded-xl font-bold px-6 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-850" onClick={() => stepperRef.current.prevCallback()}>
                  Quay lại
                </Button>
                {/*  Show cancel button in contest mode */}
                {isInContestMode && (
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={isUploading}
                    className="border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl font-bold px-6 py-2.5"
                  >
                    Hủy
                  </Button>
                )}
              </div>
            </StepperPanel>
          </Stepper>
        </div>
      </Card>
    </div>
  );
};

export default ProblemForm;