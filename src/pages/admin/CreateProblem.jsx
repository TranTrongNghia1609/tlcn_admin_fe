import React, { useState, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import TurndownService from 'turndown';
import { useNavigate } from 'react-router-dom';
import ProblemStatementSection from '@/components/admin/problems/ProblemStatementSection';
import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import PreviewProblem from '@/components/admin/problems/PreviewProblem';
import { createProblem, uploadTestCase } from '@/services/problemService';
import UploadTestcases from '@/components/admin/problems/UploadTestcases';
import LoadingSpinner from '@/components/common/LoadingSpinner';
        
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

const CreateProblem = () => {
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

  const handleFormDataChange = useCallback((field, value) => {
    const newValue =
      typeof value === "string" ? turndownService.turndown(value) : value;

    setFormData((prev) => {
      const updateNoConvert = { ...prev, [field]: value };
      const updated = { ...prev, [field]: newValue };
      formDataRef.current = updateNoConvert; 
      return updated;
    });

    console.log("Content: ", value);
  }, []);

  const handleAddExample = useCallback(() => {
    setFormData((prev) => {
      const updated = { ...prev, 
        examplesInput: [...prev.examplesInput, ''],
        examplesOutput: [...prev.examplesOutput, ''] };
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

  const handleNextSection = () => {
    if (validateStatementSection()) {
      setCurrentSection('testcase');
      toast.success('Đã lưu thông tin đề bài');
    }
  };

  const handleBackToStatement = () => {
    setCurrentSection('statement');
  };

  const handleSubmit = async () => {
    if (!validateStatementSection()) return;

    try {
      setIsSubmitting(true);
      // TODO: Implement API call to create problem
      // const response = await createProblem(formData);
      console.log('Submitting problem:', formData);
      
      toast.success('Tạo bài tập thành công');
      navigate('/problems');
    } catch (error) {
      console.error('Error creating problem:', error);
      toast.error('Không thể tạo bài tập', {
        description: error.message || 'Đã có lỗi xảy ra'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc muốn hủy? Mọi thay đổi sẽ không được lưu.')) {
      navigate('/problems');
    }
  };
  
  const handleUploadTest = async (file) => {
    setIsUploading(true);
    
    toast.promise(
      (async () => {
        try {
          const response = await createProblem(formData);
          console.log('Create problem response: ', response.data);
          const id = response.data._id;
          console.log('Created problem with ID: ', id);
          
          const uploadResponse = await uploadTestCase(id, file);
          console.log('Upload test case response: ', uploadResponse.data);
          
          setIsUploading(false);
          navigate('/problems');
        } catch (err) {
          console.log('Create problem error: ', err);
          setIsUploading(false);
          throw err;
        }
      })(),
      {
        loading: 'Đang tạo bài tập và tải lên test cases...',
        success: 'Tạo bài tập thành công',
        error: 'Không thể tạo bài tập',
      }
    );
  };

  return (
    <div className="p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
      <div className='flex items-center justify-center'>
          <h2 className="text-3xl font-bold text-gray-900">Tạo bài tập mới</h2>
      </div>
      <div className="bg-white pt-8">
          <Stepper ref={stepperRef} style={{ flexBasis: '50rem' }}>
              <StepperPanel header="Thông tin">
                  <div className="flex flex-col h-full">
                      {/* <div className="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-content-center align-items-center font-medium">Content I</div> */}
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
              <StepperPanel header="Xem truớc">
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
                    <UploadTestcases onHandleUpload={handleUploadTest}/>
                  </div>
                  <div className="flex pt-4 justify-between">
                      <Button className={'bg-[#3b82f6]'} onClick={() => stepperRef.current.prevCallback()}>
                        Back
                      </Button>
                  </div>
              </StepperPanel>
          </Stepper>
      </div>

    </div>
  );
};

export default CreateProblem;