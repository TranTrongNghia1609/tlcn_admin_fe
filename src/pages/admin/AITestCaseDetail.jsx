import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import WorkflowHeader from '@/components/admin/ai-testcase/WorkflowHeader';
import AITestCaseWorkflow from '@/components/admin/ai-testcase/AITestCaseWorkflow';

const AITestCaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-10 space-y-8">
      <WorkflowHeader 
        isNew={isNew} 
        workflowId={id} 
        onBack={() => navigate('/ai-testcases')} 
      />

      <AITestCaseWorkflow 
        workflowIdFromRoute={id}
        embedded={false}
      />
    </div>
  );
};

export default AITestCaseDetail;
