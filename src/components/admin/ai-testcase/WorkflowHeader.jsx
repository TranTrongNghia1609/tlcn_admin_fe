import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap } from 'lucide-react';

const WorkflowHeader = ({ isNew, workflowId, onBack }) => {
  return (
    <div className="flex items-center gap-4 mb-8">
      <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
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
  );
};

export default WorkflowHeader;
