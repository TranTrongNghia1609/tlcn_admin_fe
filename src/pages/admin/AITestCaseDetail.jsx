import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useSocket } from '@/context/SocketContext';
import { aiTestCaseService } from '@/services/aiTestCaseService';
import { useTheme } from '@/context/ThemeContext';

import WorkflowHeader from '@/components/admin/ai-testcase/WorkflowHeader';
import WorkflowStepper from '@/components/admin/ai-testcase/WorkflowStepper';
import PlanningPhaseCard from '@/components/admin/ai-testcase/PlanningPhaseCard';
import CodeGenerationPhaseCard from '@/components/admin/ai-testcase/CodeGenerationPhaseCard';
import ExecutionPhaseCard from '@/components/admin/ai-testcase/ExecutionPhaseCard';

const AITestCaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { on, off } = useSocket();
  const isNew = !id;

  // Global State
  const [workflowId, setWorkflowId] = useState(id || null);
  const [currentPhase, setCurrentPhase] = useState(1);
  
  // Phase 1: Planning Form
  const [statement, setStatement] = useState('');
  const [inputConstraint, setInputConstraint] = useState('');
  const [outputConstraint, setOutputConstraint] = useState('');
  const [numberOfTestCases, setNumberOfTestCases] = useState(5);
  const [inputExample, setInputExample] = useState('');
  const [outputExample, setOutputExample] = useState('');
  const [planCategories, setPlanCategories] = useState([]);
  const [isPlanLoading, setIsPlanLoading] = useState(false);

  // Phase 2: Code Generation
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isCodeLoading, setIsCodeLoading] = useState(false);

  // Phase 3: Execution
  const [testCaseUrl, setTestCaseUrl] = useState('');
  const [isExecLoading, setIsExecLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch existing data if ID exists
  useEffect(() => {
    if (!isNew && workflowId) {
      const fetchData = async () => {
        try {
          var planResponse = await aiTestCaseService.getPlan(workflowId);
          var planData = planResponse?.data;
          
          if (!planData) {
            toast.error('Kế hoạch không tồn tại!');
            navigate('/ai-testcases');
            return;
          }

          if (planData) {
            setStatement(planData.statement || '');
            setInputConstraint(planData.inputConstraint || '');
            setOutputConstraint(planData.outputConstraint || '');
            setNumberOfTestCases(planData.numberOfTestCases || 5);
            setInputExample(planData.inputExample || '');
            setOutputExample(planData.outputExample || '');
            
            const lastVersion = planData.versions?.[planData.versions.length - 1];
            if (lastVersion?.categories) {
              setPlanCategories(lastVersion.categories);
              if (planData.status === 'done') setCurrentPhase(2);
            }

            try {
              var codeDataResponse = await aiTestCaseService.getCode(workflowId);
              var codeData = codeDataResponse?.data;
              if (codeData) {
                  const lastCode = codeData.versions?.[codeData.versions.length - 1];
                  if (lastCode.planVersionNumber == lastVersion.versionNumber || lastCode?.inputCode) {
                    setInputCode(lastCode.inputCode);
                    setOutputCode(lastCode.outputCode);
                    if (codeData.status === 'done') setCurrentPhase(3);
                  }
                  if (lastCode?.s3Key) {
                    setTestCaseUrl(lastCode.s3Key);
                  }
              }
            } catch(e) {
              // No code yet
            }
          }
        } catch (error) {
          toast.error('Lỗi khi tải dữ liệu workflow. Kế hoạch có thể không tồn tại.');
          navigate('/ai-testcases');
        }
      };
      fetchData();
    }
  }, [workflowId, isNew, navigate]);

  // Setup Socket Listeners
  useEffect(() => {
    const handlePlanReady = (data) => {
      if (data.workflowId === workflowId || (!workflowId && data.workflowId)) {
        setIsPlanLoading(false);
        if (data.status === 'done') {
          setPlanCategories(data.categories || []);
          toast.success('Lên kế hoạch thành công!');
          if (!workflowId) setWorkflowId(data.workflowId);
          setCurrentPhase(2);
        } else {
          toast.error('Lên kế hoạch thất bại!');
        }
      }
    };

    const handleCodeReady = (data) => {
      if (data.workflowId === workflowId) {
        setIsCodeLoading(false);
        if (data.status === 'done') {
          setInputCode(data.inputCode || '');
          setOutputCode(data.outputCode || '');
          toast.success('Sinh mã Code Generator thành công!');
          setCurrentPhase(3);
        } else {
          toast.error('Sinh mã thất bại!');
        }
      }
    };

    const handleExecReady = (data) => {
      if (data.workflowId === workflowId) {
        setIsExecLoading(false);
        if (data.status === 'done' && !data.error) {
          setTestCaseUrl(data.s3Key || '');
          toast.success(`Thực thi thành công! Đã tạo ${data.testCount} test cases.`);
        } else {
          toast.error(`Thực thi thất bại: ${data.error || 'Lỗi không xác định'}`);
        }
      }
    };

    on('TEST_CASE_PLAN_READY', handlePlanReady);
    on('TEST_CASE_CODE_READY', handleCodeReady);
    on('COMPILER_TEST_CASE_READY', handleExecReady);

    return () => {
      off('TEST_CASE_PLAN_READY', handlePlanReady);
      off('TEST_CASE_CODE_READY', handleCodeReady);
      off('COMPILER_TEST_CASE_READY', handleExecReady);
    };
  }, [workflowId, on, off]);

  // Phase Actions
  const handleGeneratePlan = async () => {
    if (!statement.trim()) {
      toast.warning('Vui lòng nhập mô tả bài toán');
      return;
    }
    if (!inputExample.trim()) {
      toast.warning('Vui lòng nhập ví dụ Input');
      return;
    }
    if (!outputExample.trim()) {
      toast.warning('Vui lòng nhập ví dụ Output');
      return;
    }
    if (inputExample.length > 200) {
      toast.warning('Ví dụ Input không được vượt quá 200 ký tự');
      return;
    }
    if (outputExample.length > 200) {
      toast.warning('Ví dụ Output không được vượt quá 200 ký tự');
      return;
    }
    try {
      setIsPlanLoading(true);
      const payload = { statement, inputConstraint, outputConstraint, numberOfTestCases, inputExample, outputExample };
      let res;
      if (workflowId) {
        res = await aiTestCaseService.regeneratePlan(workflowId, payload);
      } else {
        res = await aiTestCaseService.createPlan(payload);
        if (res?.workflowId) setWorkflowId(res.workflowId);
      }
      toast.info('Đang yêu cầu AI lên kế hoạch...');
    } catch (error) {
      toast.error('Lỗi khi gọi API Plan');
      setIsPlanLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!workflowId) return;
    try {
      setIsCodeLoading(true);
      if (feedback.trim()) {
        await aiTestCaseService.regenerateCode(workflowId, { feedback });
        toast.info('Đang yêu cầu AI sinh lại mã với feedback...');
        setFeedback('');
      } else {
        await aiTestCaseService.generateCode(workflowId);
        toast.info('Đang yêu cầu AI sinh mã...');
      }
    } catch (error) {
      toast.error('Lỗi khi gọi API Code Generate');
      setIsCodeLoading(false);
    }
  };

  const handleExecuteCode = async () => {
    if (!workflowId) return;
    try {
      setIsExecLoading(true);
      await aiTestCaseService.executeCode(workflowId);
      toast.info('Đang gửi mã tới Compiler Service để thực thi...');
    } catch (error) {
      toast.error('Lỗi khi gọi API Execute');
      setIsExecLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!workflowId) return;
    try {
      setIsDownloading(true);
      var data = await aiTestCaseService.downloadTestCase(workflowId);
      data = data.data;
      const presignedUrl = data?.presignedUrl || null;
      if (presignedUrl && typeof presignedUrl === 'string') {
        const link = document.createElement('a');
        link.href = presignedUrl;
        link.setAttribute('download', `testcases_${workflowId}.zip`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Đã bắt đầu tải về!');
      } else {
        toast.error('Không thể lấy link tải về.');
      }
    } catch (error) {
      toast.error('Lỗi khi lấy link tải về.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-10 space-y-8">
      <WorkflowHeader 
        isNew={isNew} 
        workflowId={workflowId} 
        onBack={() => navigate('/ai-testcases')} 
      />

      <WorkflowStepper 
        currentPhase={currentPhase} 
        testCaseUrl={testCaseUrl} 
      />

      <div className="max-w-6xl mx-auto space-y-8">
        <PlanningPhaseCard 
          currentPhase={currentPhase}
          statement={statement}
          setStatement={setStatement}
          inputConstraint={inputConstraint}
          setInputConstraint={setInputConstraint}
          outputConstraint={outputConstraint}
          setOutputConstraint={setOutputConstraint}
          numberOfTestCases={numberOfTestCases}
          setNumberOfTestCases={setNumberOfTestCases}
          inputExample={inputExample}
          setInputExample={setInputExample}
          outputExample={outputExample}
          setOutputExample={setOutputExample}
          planCategories={planCategories}
          isPlanLoading={isPlanLoading}
          onGeneratePlan={handleGeneratePlan}
          onPhaseClick={() => setCurrentPhase(1)}
          onContinue={() => setCurrentPhase(2)}
        />

        <CodeGenerationPhaseCard 
          currentPhase={currentPhase}
          planCategories={planCategories}
          inputCode={inputCode}
          outputCode={outputCode}
          isCodeLoading={isCodeLoading}
          isDark={isDark}
          feedback={feedback}
          setFeedback={setFeedback}
          onGenerateCode={handleGenerateCode}
          onPhaseClick={() => (planCategories.length > 0) && setCurrentPhase(2)}
          onContinue={() => setCurrentPhase(3)}
        />

        <ExecutionPhaseCard 
          currentPhase={currentPhase}
          testCaseUrl={testCaseUrl}
          isExecLoading={isExecLoading}
          isDownloading={isDownloading}
          inputCode={inputCode}
          onPhaseClick={() => (inputCode) && setCurrentPhase(3)}
          onExecuteCode={handleExecuteCode}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
};

export default AITestCaseDetail;
