import api from '../utils/api';

const BASE_URL = '/solutions';

export const solutionService = {
  // Create solution
  createSolution: async (data) => {
    const response = await api.post(BASE_URL, data);
    return response.data;
  },

  // Get solutions by problem
  getSolutionsByProblem: async (problemShortId, params = {}) => {
    const response = await api.get(`${BASE_URL}/problem/${problemShortId}`, { params });
    return response.data;
  },

  // Get solution by ID
  getSolutionById: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Update solution
  updateSolution: async (id, data) => {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete solution
  deleteSolution: async (id) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Moderate solution (Admin)
  moderateSolution: async (id, action, reason = null) => {
    const response = await api.patch(`${BASE_URL}/${id}/moderate`, { action, reason });
    return response.data;
  },

  // Get all solutions (Admin)
  getAllSolutions: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/admin/all`, { params });
    return response.data;
  },
  checkSolutionExists: async (problemShortId) => {
    try {
      const response = await api.get(`${BASE_URL}/check/${problemShortId}`);
      return response.data;
    } catch (error) {
      console.error('Check solution error:', error);
      throw error;
    }
  }
};

export default solutionService;