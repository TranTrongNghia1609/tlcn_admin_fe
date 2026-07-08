import API from '../utils/api';

export const aiTestCaseService = {
  // Phase 1: Planning
  createPlan: async (payload, problemId = null) => {
    if (problemId)
      payload.problemId = problemId;

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
  generateCode: async (workflowId, payload = {}) => {
    const response = await API.post(`/test-case/code-generate/${workflowId}`, payload);
    return response.data;
  },

  getCode: async (workflowId) => {
    const response = await API.get(`/test-case/code-generate/${workflowId}`);
    return response.data;
  },

  regenerateCode: async (workflowId, payload) => {
    // payload can contain { feedback, mode, solutionCode }
    const response = await API.put(`/test-case/code-generate/${workflowId}`, payload);
    return response.data;
  },

  // Phase 3: Execution
  executeCode: async (workflowId, payload = {}) => {
    const response = await API.post(`/test-case/execute/${workflowId}`, payload);
    return response.data;
  },

  // Download: get presigned S3 URL and trigger download
  downloadTestCase: async (workflowId, payload = { version: 1 }) => {
    const response = await API.get(`/test-case/download/${workflowId}`, payload);
    return response.data;
  },

  applyTestCase: async (workflowId, version = null) => {
    const response = await API.post(`/test-case/apply/${workflowId}`, {version: version})
    return response.data;
  }
};
