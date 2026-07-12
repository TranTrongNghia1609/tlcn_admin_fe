import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSocket } from '@/context/SocketContext';
import { aiTestCaseService } from '@/services/aiTestCaseService';
import { useTheme } from '@/context/ThemeContext';

import WorkflowStepper from '@/components/admin/ai-testcase/WorkflowStepper';
import PlanningPhaseCard from '@/components/admin/ai-testcase/PlanningPhaseCard';
import CodeGenerationPhaseCard from '@/components/admin/ai-testcase/CodeGenerationPhaseCard';
import ExecutionPhaseCard from '@/components/admin/ai-testcase/ExecutionPhaseCard';
import VersionsPhaseCard from '@/components/admin/ai-testcase/VersionsPhaseCard';

const AITestCaseWorkflow = ({ 
  workflowIdFromRoute = null, 
  problemId = null,
  embedded = false,
  onComplete = null,
  initialPlanData = null
}) => {
  const { isDark } = useTheme();
  const { on, off } = useSocket();
  const isNew = !workflowIdFromRoute;

  // Global State
  const [workflowId, setWorkflowId] = useState(workflowIdFromRoute || null);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [planVersions, setPlanVersions] = useState([]);
  const [codeVersions, setCodeVersions] = useState([]);
  const [selectedVersionNumber, setSelectedVersionNumber] = useState(null);
  const [appliedTestCaseVersion, setAppiedTestCaseVersion] = useState(null)
  
  // Phase 1: Planning Form
  const [statement, setStatement] = useState(initialPlanData?.statement || '');
  const [inputConstraint, setInputConstraint] = useState(initialPlanData?.input || '');
  const [outputConstraint, setOutputConstraint] = useState(initialPlanData?.output || '');
  const [numberOfTestCases, setNumberOfTestCases] = useState(5);
  const [inputExample, setInputExample] = useState(initialPlanData?.examplesInput?.[0] || '');
  const [outputExample, setOutputExample] = useState(initialPlanData?.examplesOutput?.[0] || '');
  const [planCategories, setPlanCategories] = useState([]);
  const [isPlanLoading, setIsPlanLoading] = useState(false);

  // Phase 2: Code Generation
  const [codeId, setCodeId] = useState(null);
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [isUpdatingCode, setIsUpdatingCode] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [mode, setMode] = useState('ai'); // 'ai' or 'user-solution'
  const [solutionCode, setSolutionCode] = useState('');
  const [codeVersionMode, setCodeVersionMode] = useState('ai');

  // Phase 3: Execution & Previews / Manual Test Cases
  const [testCaseUrl, setTestCaseUrl] = useState('');
  const [isExecLoading, setIsExecLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [execError, setExecError] = useState('');
  const [testCases, setTestCases] = useState([]);
  const [manualTestCases, setManualTestCases] = useState([]);
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [isRebuilding, setIsRebuilding] = useState(false);

  // Fetch existing data if workflowId exists
  useEffect(() => {
    if (!isNew && workflowId) {
      const fetchData = async () => {
        try {
          var planResponse = await aiTestCaseService.getPlan(workflowId);
          var planData = planResponse?.data;
          
          if (!planData) {
            toast.error('Kế hoạch không tồn tại!');
            return;
          }

          if (planData) {
            setStatement(planData.statement || '');
            setInputConstraint(planData.inputConstraint || '');
            setOutputConstraint(planData.outputConstraint || '');
            setNumberOfTestCases(planData.numberOfTestCases || 5);
            setInputExample(planData.inputExample || '');
            setOutputExample(planData.outputExample || '');
            
            if (planData.versions) {
              setPlanVersions(planData.versions);
            }
            
            const lastVersion = planData.versions?.[planData.versions.length - 1];
            if (lastVersion?.categories) {
              setPlanCategories(lastVersion.categories);
              if (planData.status === 'done') setCurrentPhase(2);
            }

            try {
              var codeDataResponse = await aiTestCaseService.getCode(workflowId);
              var codeData = codeDataResponse?.data;
              if (codeData) {
                  if (codeData._id) setCodeId(codeData._id);
                  setAppiedTestCaseVersion(codeData.codeVersionApplied);
                  if (codeData.manualTestCases) {
                    setManualTestCases(codeData.manualTestCases);
                  }
                  if (codeData.versions) {
                    setCodeVersions(codeData.versions);
                  }
                  const lastCode = codeData.versions?.[codeData.versions.length - 1];
                  if (lastCode) {
                    setSelectedVersionNumber(lastCode.versionNumber);
                    setCodeVersionMode(lastCode.mode || 'ai');
                    setMode(lastCode.mode || 'ai');
                    if (lastCode.mode === 'user-solution' && lastCode.outputCode) {
                      setSolutionCode(lastCode.outputCode);
                    }
                  }
                  if (lastCode && (lastCode.planVersionNumber == lastVersion?.versionNumber || lastCode?.inputCode)) {
                    setInputCode(lastCode.inputCode || '');
                    setOutputCode(lastCode.outputCode || '');
                    if (codeData.status === 'done') setCurrentPhase(3);
                  }
                  if (lastCode?.s3Key) {
                    setTestCaseUrl(lastCode.s3Key);
                  }
                  if (lastCode?.testCases) {
                    setTestCases(lastCode.testCases);
                  }
                  if (lastCode && lastCode.isSuccessful === false && lastCode.errorMessage) {
                    setCodeError(lastCode.errorMessage);
                  }
              }
            } catch(e) {
              // No code yet
            }
          }
        } catch (error) {
          toast.error('Lỗi khi tải dữ liệu workflow.');
        }
      };
      fetchData();
    }
  }, [workflowId, isNew]);

  // Fetch manual test cases directly if workflowId exists/changes
  useEffect(() => {
    if (workflowId) {
      aiTestCaseService.getManualTestCases(workflowId)
        .then(res => {
          if (res?.data) setManualTestCases(res.data);
        })
        .catch(() => {});
    }
  }, [workflowId]);

  // Setup Socket Listeners
  useEffect(() => {
    const handlePlanReady = async (data) => {
      if (data.workflowId === workflowId || (!workflowId && data.workflowId)) {
        setIsPlanLoading(false);
        if (data.status === 'done') {
          setPlanCategories(data.categories || []);
          toast.success('Lên kế hoạch thành công!');
          const targetWfId = data.workflowId || workflowId;
          if (!workflowId && targetWfId) setWorkflowId(targetWfId);

          // Làm trống toàn bộ code và kết quả thực thi cũ để Phase 2 sẵn sàng cho Plan mới
          setInputCode('');
          setOutputCode('');
          setFeedback('');
          setCodeError('');
          setCodeId(null);
          setTestCaseUrl('');
          setTestCases([]);
          setExecError('');
          setCodeVersionMode('ai');
          setMode('ai');
          setSolutionCode('');

          setCurrentPhase(2);
          if (targetWfId) {
            try {
              const res = await aiTestCaseService.getPlan(targetWfId);
              if (res?.data?.versions && res.data.versions.length > 0) {
                setPlanVersions(res.data.versions);
                const latestPlanVer = res.data.versions[res.data.versions.length - 1];
                if (latestPlanVer?.versionNumber) {
                  setSelectedVersionNumber(latestPlanVer.versionNumber);
                }
              } else if (data.versionNumber) {
                setSelectedVersionNumber(data.versionNumber);
              }
            } catch(err) {}
          } else if (data.versionNumber) {
            setSelectedVersionNumber(data.versionNumber);
          }
        } else {
          toast.error('Lên kế hoạch thất bại!');
        }
      }
    };

    const handleCodeReady = async (data) => {
      if (data.workflowId === workflowId) {
        setIsCodeLoading(false);
        if (data.status === 'done') {
          setInputCode(data.inputCode || '');
          setOutputCode(data.outputCode || '');
          setCodeVersionMode(data.mode || 'ai');
          setMode(data.mode || 'ai');
          if (data.mode === 'user-solution' && data.outputCode) {
            setSolutionCode(data.outputCode);
          }
          setCodeError('');
          toast.success('Sinh mã Code Generator thành công!');
          setCurrentPhase(3);
        } else {
          const errorMsg = data.error || 'Sinh mã thất bại! Không có thông tin lỗi chi tiết.';
          setCodeError(errorMsg);
          toast.error('Sinh mã thất bại!');
        }
        try {
          const res = await aiTestCaseService.getCode(workflowId);
          if (res?.data?._id) setCodeId(res.data._id);
          if (res?.data?.versions) {
            setCodeVersions(res.data.versions);
            const lastCode = res.data.versions[res.data.versions.length - 1];
            if (lastCode) {
              setSelectedVersionNumber(lastCode.versionNumber);
              setCodeVersionMode(lastCode.mode || 'ai');
              setMode(lastCode.mode || 'ai');
              if (lastCode.mode === 'user-solution' && lastCode.outputCode) {
                setSolutionCode(lastCode.outputCode);
              }
            }
          }
        } catch(err) {}
      }
    };

    const handleExecReady = async (data) => {
      if (data.workflowId === workflowId) {
        setIsExecLoading(false);
        if (data.status === 'done' && !data.error) {
          setTestCaseUrl(data.s3Key || '');
          if (data.testCases) {
            setTestCases(data.testCases);
          }
          setExecError('');
          toast.success(`Thực thi thành công! Đã tạo ${data.testCount} test cases.`);
          onComplete?.();
        } else {
          const errorMsg = data.error || 'Lỗi không xác định';
          setExecError(errorMsg);
          toast.error(`Thực thi thất bại: ${errorMsg}`);
        }
        try {
          const res = await aiTestCaseService.getCode(workflowId);
          if (res?.data?._id) setCodeId(res.data._id);
          if (res?.data?.versions) {
            setCodeVersions(res.data.versions);
            const lastCode = res.data.versions[res.data.versions.length - 1];
            if (lastCode) {
              setSelectedVersionNumber(lastCode.versionNumber);
              setCodeVersionMode(lastCode.mode || 'ai');
              setMode(lastCode.mode || 'ai');
              if (lastCode.mode === 'user-solution' && lastCode.outputCode) {
                setSolutionCode(lastCode.outputCode);
              }
            }
          }
        } catch(err) {}
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
  }, [workflowId, on, off, onComplete]);

  // Phase Actions
  const handleGeneratePlan = async () => {
    if (!workflowId && !problemId) {
      toast.error('Vui lòng tạo hoặc chọn một bài tập trước khi sinh Testcase bằng AI.');
      return;
    }
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
      // Làm trống sẵn thông tin code & thực thi trước khi gọi tạo/sinh lại Plan
      setInputCode('');
      setOutputCode('');
      setFeedback('');
      setCodeError('');
      setCodeId(null);
      setTestCaseUrl('');
      setTestCases([]);
      setExecError('');
      setCodeVersionMode('ai');
      setMode('ai');
      setSolutionCode('');

      const payload = { statement, inputConstraint, outputConstraint, numberOfTestCases, inputExample, outputExample };
      let res;
      if (workflowId) {
        res = await aiTestCaseService.regeneratePlan(workflowId, payload);
      } else {
        res = await aiTestCaseService.createPlan(payload, problemId);
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
    if (mode === 'user-solution' && !solutionCode.trim()) {
      toast.warning('Vui lòng nhập code Lời giải Python khi sử dụng chế độ User Solution!');
      return;
    }
    try {
      setIsCodeLoading(true);
      setCodeError('');
      setExecError('');
      
      const payload = { mode };
      if (mode === 'user-solution') {
        payload.solutionCode = solutionCode;
      }
      if (feedback.trim()) {
        payload.feedback = feedback;
      }

      if (feedback.trim() || inputCode || codeVersions.length > 0) {
        await aiTestCaseService.regenerateCode(workflowId, payload);
        toast.info('Đang yêu cầu hệ thống sinh lại mã...');
        setFeedback('');
      } else {
        await aiTestCaseService.generateCode(workflowId, payload);
        toast.info('Đang yêu cầu hệ thống sinh mã...');
      }
    } catch (error) {
      toast.error('Lỗi khi gọi API Code Generate');
      setIsCodeLoading(false);
    }
  };

  const handleUseErrorAsFeedback = (errorMsg) => {
    setFeedback(errorMsg);
    setCodeError('');
    setExecError('');
    setCurrentPhase(2);
  };

  const handleUpdateCode = async (newInputCode, newOutputCode) => {
    let targetCodeId = codeId;
    if (!targetCodeId && workflowId) {
      try {
        const res = await aiTestCaseService.getCode(workflowId);
        if (res?.data?._id) {
          targetCodeId = res.data._id;
          setCodeId(res.data._id);
        }
      } catch (e) {}
    }

    if (!targetCodeId) {
      toast.error('Không tìm thấy ID của Test Case Code. Vui lòng sinh mã trước khi cập nhật.');
      return;
    }

    const targetVersion = selectedVersionNumber || (codeVersions.length > 0 ? codeVersions[codeVersions.length - 1].versionNumber : 1);
    try {
      setIsUpdatingCode(true);
      const payload = {
        inputCode: newInputCode !== undefined ? newInputCode : inputCode,
        outputCode: newOutputCode !== undefined ? newOutputCode : outputCode,
        version: targetVersion
      };
      await aiTestCaseService.updateCode(targetCodeId, payload);
      toast.success(`Đã cập nhật Input & Output Code cho Version Code #${targetVersion}!`);
      
      if (newInputCode !== undefined) setInputCode(newInputCode);
      if (newOutputCode !== undefined) setOutputCode(newOutputCode);

      try {
        const res = await aiTestCaseService.getCode(workflowId);
        if (res?.data?.versions) {
          setCodeVersions(res.data.versions);
        }
      } catch (err) {
        setCodeVersions(prev => prev.map(v => 
          v.versionNumber === targetVersion 
            ? { ...v, inputCode: payload.inputCode, outputCode: payload.outputCode } 
            : v
        ));
      }
    } catch (error) {
      console.error('Update code error:', error);
      toast.error('Lỗi khi cập nhật Code Generator: ' + (error?.response?.data?.message || error?.message || 'Lỗi không xác định'));
    } finally {
      setIsUpdatingCode(false);
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

  const handleApplyTestCase = async () => {
    if (!workflowId) return;
    // currently don't put version in payload, BE will apply latest version
    try { 
      setIsApplying(true);
      const response = await aiTestCaseService.applyTestCase(workflowId);
      var data = response.data;
      toast.success("Thành công sử dụng test case cho bài tập")
    } catch (error) {
      toast.error("Lỗi khi áp dụng test cases");
      console.log("loix: ", error)
    } finally {
      setIsApplying(false);
    }
  }

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

  const handleAddManualTestCase = async (input, output) => {
    if (!workflowId) {
      toast.error('Workflow chưa được tạo.');
      return;
    }
    try {
      setIsManualLoading(true);
      const res = await aiTestCaseService.addManualTestCase(workflowId, { input, output });
      if (res?.success && res.data) {
        setManualTestCases(prev => [...prev, res.data]);
        toast.success(res.message || 'Đã thêm testcase thủ công thành công');
      } else {
        toast.error('Không thể thêm testcase thủ công');
      }
    } catch (error) {
      toast.error('Lỗi khi thêm testcase thủ công');
    } finally {
      setIsManualLoading(false);
    }
  };

  const handleUpdateManualTestCase = async (index, input, output) => {
    if (!workflowId) return;
    try {
      setIsManualLoading(true);
      const res = await aiTestCaseService.updateManualTestCase(workflowId, index, { input, output });
      if (res?.success && res.data) {
        setManualTestCases(prev => prev.map(tc => tc.index === Number(index) ? res.data : tc));
        toast.success(res.message || 'Đã cập nhật testcase thủ công');
      } else {
        toast.error('Không thể cập nhật testcase thủ công');
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật testcase');
    } finally {
      setIsManualLoading(false);
    }
  };

  const handleDeleteManualTestCase = async (index) => {
    if (!workflowId) return;
    try {
      setIsManualLoading(true);
      const res = await aiTestCaseService.deleteManualTestCase(workflowId, index);
      if (res?.success) {
        setManualTestCases(prev => prev.filter(tc => tc.index !== Number(index)));
        toast.success(res.message || 'Đã xóa testcase thủ công');
      } else {
        toast.error('Không thể xóa testcase');
      }
    } catch (error) {
      toast.error('Lỗi khi xóa testcase');
    } finally {
      setIsManualLoading(false);
    }
  };

  const handleRebuildTestCases = async () => {
    if (!workflowId) return;
    try {
      setIsRebuilding(true);
      const res = await aiTestCaseService.rebuildAndMergeTestCases(workflowId);
      if (res?.success && res.data) {
        const newVer = res.data;
        toast.success(res.message || `Đã gộp testcase thành công! Tổng cộng: ${newVer.totalTestCases || (newVer.testCases ? newVer.testCases.length : 0)} test cases.`);
        setTestCaseUrl(newVer.s3Key || '');
        setTestCases(newVer.testCases || []);
        setSelectedVersionNumber(newVer.versionNumber);
        setCodeVersionMode(newVer.mode || 'merged');
        setMode(newVer.mode || 'merged');
        // Reload codeVersions
        try {
          const codeDataRes = await aiTestCaseService.getCode(workflowId);
          if (codeDataRes?.data?._id) setCodeId(codeDataRes.data._id);
          if (codeDataRes?.data?.versions) {
            setCodeVersions(codeDataRes.data.versions);
          }
        } catch (e) {}
      } else {
        toast.error('Lỗi khi gộp testcase.');
      }
    } catch (error) {
      toast.error('Lỗi khi gọi API Rebuild & Merge');
    } finally {
      setIsRebuilding(false);
    }
  };

  const handleSelectVersion = (ver, targetPhase = null, planObj = null) => {
    // Nếu ver là null (tức là người dùng chọn một Plan Version chưa có code test case)
    if (!ver && planObj) {
      if (planObj.categories) {
        setPlanCategories(planObj.categories);
      } else if (planVersions && planVersions.length > 0) {
        const matchingPlanVer = planVersions.find(p => p.versionNumber === planObj.versionNumber);
        if (matchingPlanVer?.categories) setPlanCategories(matchingPlanVer.categories);
      }
      setInputCode('');
      setOutputCode('');
      setFeedback('');
      setCodeError('');
      setExecError('');
      setTestCaseUrl('');
      setTestCases([]);
      setSelectedVersionNumber(null);
      setCodeVersionMode('ai');
      setMode('ai');
      setCurrentPhase(2);
      toast.info(`Đã chuyển sang Bước 2 với Kế hoạch Version Plan #${planObj.versionNumber}. Hãy nhấn "Sinh Mã"!`);
      return;
    }

    if (!ver) return;
    
    // 1. Update Step 1 (Planning) data from planVersions matching ver.planVersionNumber
    if (planVersions && planVersions.length > 0) {
      const matchingPlanVer = planVersions.find(p => p.versionNumber === ver.planVersionNumber) || planVersions[planVersions.length - 1];
      if (matchingPlanVer?.categories) {
        setPlanCategories(matchingPlanVer.categories);
      }
    }

    // 2. Update Step 2 (Code Generation) data
    setInputCode(ver.inputCode || '');
    setOutputCode(ver.outputCode || '');
    setFeedback(ver.feedback || '');
    setCodeVersionMode(ver.mode || 'ai');
    setMode(ver.mode || 'ai');
    if (ver.mode === 'user-solution' && ver.outputCode) {
      setSolutionCode(ver.outputCode);
    }
    if (ver.isSuccessful === false && ver.errorMessage) {
      setCodeError(ver.errorMessage);
    } else {
      setCodeError('');
    }

    // 3. Update Step 3 (Execution) data
    setTestCaseUrl(ver.s3Key || '');
    setTestCases(ver.testCases || []);
    if (ver.isSuccessful === false && ver.errorMessage) {
      setExecError(ver.errorMessage);
    } else {
      setExecError('');
    }

    // 4. Track selected version
    setSelectedVersionNumber(ver.versionNumber);

    toast.success(`Đã hiển thị Version Code #${ver.versionNumber} trong 3 bước trước!`);

    // 5. Navigate to targetPhase if specified, otherwise jump to Step 2 by default
    if (targetPhase) {
      setCurrentPhase(targetPhase);
    } else {
      setCurrentPhase(2);
    }
  };

  const handleStepClick = (step) => {
    if (step === 1) setCurrentPhase(1);
    if (step === 2 && (planCategories.length > 0 || inputCode)) setCurrentPhase(2);
    if (step === 3 && (inputCode || testCaseUrl)) setCurrentPhase(3);
    if (step === 4 && (planVersions.length > 0 || codeVersions.length > 0)) setCurrentPhase(4);
  };

  return (
    <div className={embedded ? 'space-y-6' : 'space-y-8'}>
      <WorkflowStepper 
        currentPhase={currentPhase} 
        testCaseUrl={testCaseUrl}
        onStepClick={handleStepClick}
        canGoStep2={planCategories.length > 0 || Boolean(inputCode)}
        canGoStep3={Boolean(inputCode) || Boolean(testCaseUrl)}
        canGoStep4={planVersions.length > 0 || codeVersions.length > 0}
      />

      <div className={embedded ? 'space-y-6' : 'max-w-6xl mx-auto space-y-8'}>
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
          selectedVersionNumber={selectedVersionNumber}
        />

        <CodeGenerationPhaseCard 
          currentPhase={currentPhase}
          planCategories={planCategories}
          inputCode={inputCode}
          setInputCode={setInputCode}
          outputCode={outputCode}
          setOutputCode={setOutputCode}
          isCodeLoading={isCodeLoading}
          isDark={isDark}
          feedback={feedback}
          setFeedback={setFeedback}
          codeError={codeError}
          onGenerateCode={handleGenerateCode}
          onUseErrorAsFeedback={handleUseErrorAsFeedback}
          onPhaseClick={() => (planCategories.length > 0 || inputCode) && setCurrentPhase(2)}
          onContinue={() => setCurrentPhase(3)}
          selectedVersionNumber={selectedVersionNumber}
          onGoToVersions={() => (planVersions.length > 0 || codeVersions.length > 0) && setCurrentPhase(4)}
          mode={mode}
          setMode={setMode}
          solutionCode={solutionCode}
          setSolutionCode={setSolutionCode}
          codeVersionMode={codeVersionMode}
          onUpdateCode={handleUpdateCode}
          isUpdatingCode={isUpdatingCode}
          codeVersions={codeVersions}
        />

        <ExecutionPhaseCard 
          currentPhase={currentPhase}
          testCaseUrl={testCaseUrl}
          isExecLoading={isExecLoading}
          isDownloading={isDownloading}
          isApplying={isApplying}
          inputCode={inputCode}
          execError={execError}
          onPhaseClick={() => (inputCode || testCaseUrl) && setCurrentPhase(3)}
          onExecuteCode={handleExecuteCode}
          onDownload={handleDownload}
          onApplyTestCase={handleApplyTestCase}
          isAppliedTestCase={selectedVersionNumber === appliedTestCaseVersion}
          problemId={problemId}
          onUseErrorAsFeedback={handleUseErrorAsFeedback}
          selectedVersionNumber={selectedVersionNumber}
          onGoToVersions={() => (planVersions.length > 0 || codeVersions.length > 0) && setCurrentPhase(4)}
          testCases={testCases}
          manualTestCases={manualTestCases}
          isManualLoading={isManualLoading}
          isRebuilding={isRebuilding}
          onAddManualTestCase={handleAddManualTestCase}
          onUpdateManualTestCase={handleUpdateManualTestCase}
          onDeleteManualTestCase={handleDeleteManualTestCase}
          onRebuildTestCases={handleRebuildTestCases}
        />

        <VersionsPhaseCard
          currentPhase={currentPhase}
          planVersions={planVersions}
          codeVersions={codeVersions}
          selectedVersionNumber={selectedVersionNumber}
          onSelectVersion={handleSelectVersion}
          onPhaseClick={() => (planVersions.length > 0 || codeVersions.length > 0) && setCurrentPhase(4)}
          isDark={isDark}
        />
      </div>
    </div>
  );
};

export default AITestCaseWorkflow;
