import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const StepIndicator = ({ num, label, isActive, isCompleted, onClick, disabled }) => (
  <div 
    onClick={!disabled ? onClick : undefined}
    className={`flex flex-col items-center w-32 ${isActive ? 'opacity-100' : disabled ? 'opacity-40 cursor-not-allowed' : 'opacity-70 hover:opacity-100 cursor-pointer'} transition-all`}
  >
    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-3 shadow-lg transition-colors duration-300
      ${isCompleted 
        ? 'bg-emerald-500 text-white shadow-emerald-500/40' 
        : isActive 
          ? (num === 4 ? 'bg-amber-500 text-white shadow-amber-500/50 ring-4 ring-amber-500/20' : 'bg-indigo-600 text-white shadow-indigo-600/50 ring-4 ring-indigo-600/20')
          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
    >
      {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : num}
    </div>
    <span className={`text-sm font-bold ${isActive ? (num === 4 ? 'text-amber-700 dark:text-amber-400' : 'text-indigo-700 dark:text-indigo-400') : 'text-slate-500'} text-center`}>
      {label}
    </span>
  </div>
);

const WorkflowStepper = ({ 
  currentPhase, 
  testCaseUrl, 
  onStepClick, 
  canGoStep2 = true, 
  canGoStep3 = true, 
  canGoStep4 = true 
}) => {
  return (
    <div className="flex justify-center items-start mb-12 relative max-w-4xl mx-auto">
      <div className="absolute top-6 left-[10%] right-[10%] h-1 bg-slate-200 dark:bg-slate-800 -z-10 rounded-full" />
      <div className="absolute top-6 left-[10%] h-1 bg-indigo-600 -z-10 rounded-full transition-all duration-500" 
           style={{ width: currentPhase === 1 ? '0%' : currentPhase === 2 ? '27%' : currentPhase === 3 ? '53%' : '80%' }} />
      
      <div className="flex justify-between w-full">
        <StepIndicator num={1} label="Lập kế hoạch" isActive={currentPhase === 1} isCompleted={currentPhase > 1} onClick={() => onStepClick?.(1)} />
        <StepIndicator num={2} label="Sinh mã Generator" isActive={currentPhase === 2} isCompleted={currentPhase > 2} onClick={() => onStepClick?.(2)} disabled={!canGoStep2} />
        <StepIndicator num={3} label="Thực thi & Tải về" isActive={currentPhase === 3} isCompleted={currentPhase > 3 || Boolean(testCaseUrl)} onClick={() => onStepClick?.(3)} disabled={!canGoStep3} />
        <StepIndicator num={4} label="Lịch sử phiên bản" isActive={currentPhase === 4} isCompleted={false} onClick={() => onStepClick?.(4)} disabled={!canGoStep4} />
      </div>
    </div>
  );
};

export default WorkflowStepper;
