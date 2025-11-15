import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
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

const ProblemForm = ({ initialData = null, mode = 'create' }) => {
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

  // Initialize form data when editing
  const [isLoading, setIsLoading] =  useState(true);
  
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData(initialData);
      const copyData = { ...initialData };
      copyData.statement = renderMd(initialData.statement || '');
      copyData.input = renderMd(initialData.input || '');
      copyData.output = renderMd(initialData.output || '');
      formDataRef.current = copyData;
      console.log('copyData: ', copyData);
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
      formDataRef.current = {
        ...formDataRef.current,
        [field]: value
      };
      return updated;
    });
  }, []);

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
    if (window.confirm('Bạn có chắc muốn hủy? Mọi thay đổi sẽ không được lưu.')) {
      navigate('/problems');
    }
  };

  const handleUploadTest = async (file) => {
    setIsUploading(true);
  
    try {
      const actionPromise = mode === 'create'
        ? (async () => {
            const response = await createProblem(formData);
            const id = response.data._id;
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
  
      // toast.promise sẽ tự động handle success/error
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
  
      // Chỉ chạy khi thành công
      await actionPromise;
      setIsUploading(false);
      navigate('/problems');
      
    } catch (err) {
      console.log(`${mode === 'create' ? 'Create' : 'Update'} problem error:`, err);
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }


  return (
    <div className='p-8 space-y-6 max-w-[1400px] mx-auto'>
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
              </div>
            </StepperPanel>
          </Stepper>
        </div>
      </Card>
    </div>
  );
};

export default ProblemForm;