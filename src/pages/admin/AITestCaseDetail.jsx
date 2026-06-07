import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSocket } from '@/context/SocketContext';
import { aiTestCaseService } from '@/services/aiTestCaseService';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { githubLight } from '@uiw/codemirror-theme-github';
import { useTheme } from '@/context/ThemeContext';
import { CheckCircle2, Circle, Loader2, ArrowLeft, Send, Download, Terminal, RefreshCw, Zap, Bot, ArrowRight, Play } from 'lucide-react';

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
                  if (lastCode.planVersionNumber == lastVersion.versionNumber ||lastCode?.inputCode) {
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
  }, [workflowId, isNew]);

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
      // Backend returns a presigned URL; open it to trigger browser download
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

  // UI Components
  const StepIndicator = ({ num, label, isActive, isCompleted }) => (
    <div className={`flex flex-col items-center w-32 ${isActive ? 'opacity-100' : 'opacity-50'} transition-opacity`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-3 shadow-lg transition-colors duration-300
        ${isCompleted 
          ? 'bg-emerald-500 text-white shadow-emerald-500/40' 
          : isActive 
            ? 'bg-indigo-600 text-white shadow-indigo-600/50 ring-4 ring-indigo-600/20' 
            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
      >
        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : num}
      </div>
      <span className={`text-sm font-bold ${isActive ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-500'} text-center`}>
        {label}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/ai-testcases')} className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Zap className="text-amber-500 w-6 h-6" />
            {isNew ? 'Khởi tạo Workflow Mới' : `Chi tiết Workflow: ${workflowId.substring(0,8)}...`}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Sử dụng sức mạnh của AI để tự động hóa quá trình sinh bộ test.</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex justify-center items-start mb-12 relative max-w-3xl mx-auto">
        <div className="absolute top-6 left-[10%] right-[10%] h-1 bg-slate-200 dark:bg-slate-800 -z-10 rounded-full" />
        <div className="absolute top-6 left-[10%] h-1 bg-indigo-600 -z-10 rounded-full transition-all duration-500" 
             style={{ width: currentPhase === 1 ? '0%' : currentPhase === 2 ? '40%' : '80%' }} />
        
        <div className="flex justify-between w-full">
          <StepIndicator num={1} label="Lập kế hoạch" isActive={currentPhase === 1} isCompleted={currentPhase > 1} />
          <StepIndicator num={2} label="Sinh mã Generator" isActive={currentPhase === 2} isCompleted={currentPhase > 2} />
          <StepIndicator num={3} label="Thực thi & Tải về" isActive={currentPhase === 3} isCompleted={testCaseUrl !== ''} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Phase 1: Planning Form */}
        <Card className={`overflow-hidden border-0 shadow-2xl transition-all duration-500 ${currentPhase === 1 ? 'ring-2 ring-indigo-500 ring-offset-4 ring-offset-slate-50 dark:ring-offset-slate-950' : 'opacity-70 grayscale-[30%] hover:grayscale-0'}`}>
          <div className="bg-gradient-to-r from-slate-100 to-white dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-5 flex justify-between items-center cursor-pointer"
               onClick={() => setCurrentPhase(1)}>
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-400 p-1.5 rounded-lg">1</span> 
              Thông tin bài toán & Kế hoạch
            </h2>
          </div>
          
          {currentPhase === 1 && (
            <div className="p-8 bg-white dark:bg-slate-900">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Đề bài / Statement <span className="text-red-500">*</span></label>
                    <textarea 
                      className="w-full h-32 rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none shadow-inner"
                      placeholder="Nhập nội dung đề bài thuật toán vào đây..."
                      value={statement}
                      onChange={e => setStatement(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Input Constraints</label>
                      <textarea 
                        className="w-full h-24 rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm p-3 focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                        placeholder="VD: 1 <= N <= 10^5"
                        value={inputConstraint}
                        onChange={e => setInputConstraint(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Output Constraints</label>
                      <textarea 
                        className="w-full h-24 rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm p-3 focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                        placeholder="Định dạng kết quả đầu ra"
                        value={outputConstraint}
                        onChange={e => setOutputConstraint(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Ví dụ Input <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className={`w-full h-24 rounded-xl border bg-slate-50 dark:bg-slate-950 text-sm p-3 focus:ring-2 focus:ring-indigo-500 transition-all resize-none ${
                          inputExample.length > 200
                            ? 'border-red-400 focus:ring-red-400'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}
                        placeholder="VD: 5\n1 2 3 4 5"
                        maxLength={200}
                        value={inputExample}
                        onChange={e => setInputExample(e.target.value)}
                      />
                      <p className={`text-xs mt-1 text-right ${
                        inputExample.length > 180 ? 'text-red-500 font-semibold' : 'text-slate-400'
                      }`}>
                        {inputExample.length}/200
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Ví dụ Output <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className={`w-full h-24 rounded-xl border bg-slate-50 dark:bg-slate-950 text-sm p-3 focus:ring-2 focus:ring-indigo-500 transition-all resize-none ${
                          outputExample.length > 200
                            ? 'border-red-400 focus:ring-red-400'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}
                        placeholder="VD: 15"
                        maxLength={200}
                        value={outputExample}
                        onChange={e => setOutputExample(e.target.value)}
                      />
                      <p className={`text-xs mt-1 text-right ${
                        outputExample.length > 180 ? 'text-red-500 font-semibold' : 'text-slate-400'
                      }`}>
                        {outputExample.length}/200
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Số lượng Testcases mong muốn</label>
                    <input 
                      type="number" 
                      className="w-full rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm p-3 focus:ring-2 focus:ring-indigo-500 transition-all max-w-[200px]"
                      value={numberOfTestCases}
                      min={1} max={50}
                      onChange={e => setNumberOfTestCases(parseInt(e.target.value))}
                    />
                  </div>
                  <Button 
                    onClick={handleGeneratePlan} 
                    disabled={isPlanLoading || !statement.trim() || !inputExample.trim() || !outputExample.trim() || inputExample.length > 200 || outputExample.length > 200}
                    className="w-full lg:w-auto px-8 py-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-base shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02]"
                  >
                    {isPlanLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Bot className="w-5 h-5 mr-2" />}
                    {planCategories.length > 0 ? 'Sinh Lại Kế Hoạch' : 'Phân Tích & Sinh Kế Hoạch'}
                  </Button>
                </div>
                
                {/* Plan Results Display */}
                <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-inner">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-500 w-5 h-5" /> Kết quả Kế Hoạch
                  </h3>
                  
                  {isPlanLoading ? (
                    <div className="h-48 flex flex-col items-center justify-center text-slate-500">
                      <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-30 rounded-full animate-pulse" />
                        <Bot className="w-12 h-12 mb-4 text-indigo-500 relative animate-bounce" />
                      </div>
                      <p className="font-medium animate-pulse">AI đang suy nghĩ và phân tích...</p>
                    </div>
                  ) : planCategories.length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Dưới đây là cấu trúc testcases mà AI đề xuất:</p>
                      <div className="space-y-3">
                        {planCategories.map((cat, idx) => (
                          <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-xl border-l-4 border-indigo-500 shadow-sm flex items-start gap-4">
                            <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 font-black text-xl w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                              {cat.count}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 dark:text-slate-200 capitalize text-sm">{cat.category}</div>
                              <div className="text-sm text-slate-500 mt-1">{cat.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button onClick={() => setCurrentPhase(2)} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6">
                        Đồng ý & Tiếp Tục Sinh Code <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  ) : (
                    <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-sm">
                      Nhập đề bài và click sinh kế hoạch để xem kết quả tại đây.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Phase 2: Code Generation */}
        <Card className={`overflow-hidden border-0 shadow-2xl transition-all duration-500 ${currentPhase === 2 ? 'ring-2 ring-purple-500 ring-offset-4 ring-offset-slate-50 dark:ring-offset-slate-950' : 'opacity-70 grayscale-[30%] hover:grayscale-0'}`}>
          <div className="bg-gradient-to-r from-slate-100 to-white dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-5 flex justify-between items-center cursor-pointer"
               onClick={() => (planCategories.length > 0) && setCurrentPhase(2)}>
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-400 p-1.5 rounded-lg">2</span> 
              Sinh Mã (Code Generation)
            </h2>
          </div>
          
          {currentPhase === 2 && (
            <div className="p-8 bg-white dark:bg-slate-900 space-y-8">
              
              {!inputCode && !isCodeLoading && (
                 <div className="text-center p-12 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <Terminal className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Sẵn sàng sinh Code Python</h3>
                    <p className="text-slate-500 mb-6">AI sẽ viết script tạo Input và Output tự động dựa trên Kế hoạch ở Bước 1.</p>
                    <Button onClick={handleGenerateCode} className="px-8 py-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg shadow-purple-500/30">
                      <Bot className="w-5 h-5 mr-2" /> Bắt đầu Sinh Code
                    </Button>
                 </div>
              )}

              {isCodeLoading && (
                <div className="h-64 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-purple-600 dark:text-purple-400 font-bold animate-pulse text-lg">AI đang viết code cho bạn...</p>
                </div>
              )}

              {inputCode && !isCodeLoading && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Input Code */}
                  <div className="space-y-2 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 font-bold text-sm text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Input Generator (Python)</span>
                      <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500">Read-only</span>
                    </div>
                    <div className="h-[400px] overflow-auto custom-scrollbar">
                      <CodeMirror
                        value={inputCode}
                        height="400px"
                        extensions={[python()]}
                        theme={isDark ? vscodeDark : githubLight}
                        editable={false}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* Output Code */}
                  <div className="space-y-2 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 font-bold text-sm text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Output Generator (Python)</span>
                      <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500">Read-only</span>
                    </div>
                    <div className="h-[400px] overflow-auto custom-scrollbar">
                      <CodeMirror
                        value={outputCode}
                        height="400px"
                        extensions={[python()]}
                        theme={isDark ? vscodeDark : githubLight}
                        editable={false}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {inputCode && !isCodeLoading && (
                <div className="bg-purple-50 dark:bg-purple-900/10 rounded-2xl p-6 border border-purple-100 dark:border-purple-900/30">
                  <h3 className="font-bold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" /> Phản hồi & Tinh chỉnh Code
                  </h3>
                  <div className="flex gap-4">
                    <textarea 
                      className="flex-1 rounded-xl border-purple-200 dark:border-purple-800/50 bg-white dark:bg-slate-900 p-4 text-sm focus:ring-2 focus:ring-purple-500 resize-none shadow-inner"
                      placeholder="Code có vấn đề? Hãy mô tả lỗi hoặc mong muốn thay đổi để AI sửa lại..."
                      rows={2}
                      value={feedback}
                      onChange={e => setFeedback(e.target.value)}
                    />
                    <Button onClick={handleGenerateCode} disabled={!feedback.trim()} className="px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shrink-0">
                      <Send className="w-4 h-4 mr-2" /> Gửi
                    </Button>
                  </div>
                  
                  <div className="mt-6 flex justify-end border-t border-purple-200/50 dark:border-purple-800/30 pt-6">
                    <Button onClick={() => setCurrentPhase(3)} className="px-8 py-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/30 text-base">
                      Chốt Code & Tiếp Tục <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Phase 3: Execution */}
        <Card className={`overflow-hidden border-0 shadow-2xl transition-all duration-500 ${currentPhase === 3 ? 'ring-2 ring-emerald-500 ring-offset-4 ring-offset-slate-50 dark:ring-offset-slate-950' : 'opacity-70 grayscale-[30%] hover:grayscale-0'}`}>
           <div className="bg-gradient-to-r from-slate-100 to-white dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-5 flex justify-between items-center cursor-pointer"
               onClick={() => (inputCode) && setCurrentPhase(3)}>
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400 p-1.5 rounded-lg">3</span> 
              Thực thi & Tải về
            </h2>
          </div>
          
          {currentPhase === 3 && (
            <div className="p-8 bg-white dark:bg-slate-900 text-center">
              
              {!testCaseUrl && !isExecLoading && (
                 <div className="max-w-md mx-auto space-y-6">
                   <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Terminal className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                   </div>
                   <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Thực thi Code Generator</h3>
                   <p className="text-slate-500">Hệ thống sẽ chạy các file Python trong môi trường ảo, tạo ra các tệp `.in` và `.out`, và nén lại thành tệp ZIP cho bạn.</p>
                   <Button onClick={handleExecuteCode} className="w-full py-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-xl shadow-emerald-500/30">
                     <Play className="w-6 h-6 mr-2 fill-current" /> Bắt đầu Chạy (Execute)
                   </Button>
                 </div>
              )}

              {isExecLoading && (
                <div className="py-16 space-y-6 max-w-md mx-auto">
                   <div className="bg-slate-900 rounded-xl p-6 shadow-2xl relative overflow-hidden font-mono text-left">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-indigo-500 to-purple-500" />
                     <div className="flex gap-2 mb-4">
                       <div className="w-3 h-3 rounded-full bg-red-500" />
                       <div className="w-3 h-3 rounded-full bg-amber-500" />
                       <div className="w-3 h-3 rounded-full bg-emerald-500" />
                     </div>
                     <p className="text-emerald-400 text-sm mb-2">$ python input_generator.py</p>
                     <p className="text-slate-400 text-xs mb-2">Generating testcases...</p>
                     <p className="text-emerald-400 text-sm mb-2">$ python output_generator.py</p>
                     <p className="text-slate-400 text-xs mb-2">Solving testcases...</p>
                     <p className="text-indigo-400 text-sm animate-pulse">$ zip compress...</p>
                   </div>
                   <p className="font-bold text-slate-700 dark:text-slate-300">Đang biên dịch và đóng gói, vui lòng chờ...</p>
                </div>
              )}

              {testCaseUrl && !isExecLoading && (
                <div className="py-12 max-w-lg mx-auto bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-900/20 dark:to-slate-900 rounded-3xl border border-emerald-100 dark:border-emerald-800/50 shadow-xl">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/40">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Hoàn tất xuất sắc!</h3>
                  <p className="text-slate-500 mb-8 px-6">Bộ testcase đã được tạo thành công và sẵn sàng để tải về.</p>
                  
                  <div className="px-8">
                    <Button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="w-full py-6 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-base transition-transform hover:scale-105 active:scale-95"
                    >
                      {isDownloading
                        ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang lấy link...</>
                        : <><Download className="w-5 h-5 mr-2" /> Tải về tệp TestCases (ZIP)</>}
                    </Button>
                  </div>
                </div>
              )}

            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AITestCaseDetail;
