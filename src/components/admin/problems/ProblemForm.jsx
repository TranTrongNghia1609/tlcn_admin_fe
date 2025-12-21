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
  
  const [formData, setFormData] = useState({
    name: '',
    statement: '',
    input: '',
    output: '',
    tags: [],
    time: 1,
    memory: 512,
    difficulty: 'Easy',
    img: [],
    isPrivate: false,
    isPdf: false,
    examplesInput: [],
    examplesOutput: []
  });
  
  const formDataRef = useRef(null);
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
      if (mode == 'edit'){
        formDataRef.current = {
          ...formDataRef.current,
          [field]: value
        };
      }
      else{
        formDataRef.current = {
          ...prev,
          [field]: value
        };
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
      formDataRef.current.examplesInput = updated.examplesInput;
      formDataRef.current.examplesOutput = updated.examplesOutput;
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
      formDataRef.current.examplesInput = updated.examplesInput;
      formDataRef.current.examplesOutput = updated.examplesOutput;
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
      formDataRef.current.examplesInput = updated.examplesInput;
      formDataRef.current.examplesOutput = updated.examplesOutput;
      return updated;
    });
  }, []);

  const handleCancel = () => {
    if (isInContestMode) {
      onProblemCreated?.(null);
    } else {
      if (window.confirm('Bạn có chắc muốn hủy? Mọi thay đổi sẽ không được lưu.')) {
        navigate('/problems');
      }
    }
  };

  const handleUploadTest = async (file) => {
    setIsUploading(true);
  
    try {
      let createdProblem = null;

      const actionPromise = mode === 'create'
        ? (async () => {
            const response = await createProblem(formData);
            const id = response.data._id;
            createdProblem = response.data;
            
            if (file != null) {
              await uploadTestCase(id, file);
            }
            return response;
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
    <div className={isInContestMode ? 'space-y-6' : 'p-8 space-y-6 max-w-[1400px] mx-auto'}>
      {/*  Only show header when NOT in contest mode */}
      {!isInContestMode && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleCancel}
                className="hover:bg-gray-100"
                disabled={isUploading}
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Quay lại
              </Button>
            </div>
          </div>
          
          <div className='flex items-center justify-center'>
            <h2 className="text-3xl font-bold text-gray-900">
              {mode === 'create' ? 'Tạo bài tập mới' : 'Cập nhật bài tập'}
            </h2>
          </div>
        </>
      )}
      
      {/*  Show title in contest mode */}
      {isInContestMode && (
        <div className='flex items-center justify-center'>
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Tạo bài tập mới cho kỳ thi' : 'Cập nhật bài tập'}
          </h2>
        </div>
      )}
      
      <Card className={'pt-10 px-2'}>
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
              <div className="flex pt-4 justify-end">
                <Button className={'bg-[#3b82f6]'} onClick={() => stepperRef.current.nextCallback()}>
                  Next
                </Button>
              </div>
            </StepperPanel>
            
            <StepperPanel header="Xem trước">
              <div className="flex flex-column h-full">
                <PreviewProblem problem={formData}/>
              </div>
              <div className="flex pt-4 justify-between">
                <Button className={'bg-[#3b82f6]'} onClick={() => stepperRef.current.prevCallback()}>
                  Back
                </Button>
                <Button className={'bg-[#3b82f6]'} onClick={() => stepperRef.current.nextCallback()}>
                  Next
                </Button>
              </div>
            </StepperPanel>
            
            <StepperPanel header="Test cases">
              <div className="flex flex-column h-full">
                <UploadTestcases 
                  onHandleUpload={handleUploadTest}
                  isUpdate={mode === 'edit'}
                  zipName={initialData?.zipName}
                />
              </div>
              <div className="flex pt-4 justify-between">
                <Button className={'bg-[#3b82f6]'} onClick={() => stepperRef.current.prevCallback()}>
                  Back
                </Button>
                {/*  Show cancel button in contest mode */}
                {isInContestMode && (
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={isUploading}
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