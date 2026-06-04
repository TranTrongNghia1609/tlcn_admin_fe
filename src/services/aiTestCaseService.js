import API from '../utils/api';

export const aiTestCaseService = {
  // Phase 1: Planning
  createPlan: async (payload) => {
    const response = await API.post('/test-case/plan', payload);
    return response.data;
  },
  
  getPlan: async (workflowId) => {
    const response = await API.get(`/test-case/plan/${workflowId}`);
    return response.data;
  },
  
  regeneratePlan: async (workflowId, payload) => {
    const response = await API.put(`/test-case/plan/${workflowId}`, payload);
    return response.data;
  },

  getAllPlans: async () => {
    const response = await API.get('/test-case/plan');
    return response.data;
  },

  // Phase 2: Code Generation
  generateCode: async (workflowId) => {
    const response = await API.post(`/test-case/code-generate/${workflowId}`);
    return response.data;
  },

  getCode: async (workflowId) => {
    const response = await API.get(`/test-case/code-generate/${workflowId}`);
    return response.data;
  },

  regenerateCode: async (workflowId, payload) => {
    // payload should contain { feedback }
    const response = await API.put(`/test-case/code-generate/${workflowId}`, payload);
    return response.data;
  },

  // Phase 3: Execution
  executeCode: async (workflowId, payload = {}) => {
    const response = await API.post(`/test-case/execute/${workflowId}`, payload);
    return response.data;
  }
};
