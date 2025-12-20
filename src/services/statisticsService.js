import api from '../utils/api';
import { STATISTICS_ENDPOINTS } from '@/config/endpoints';

/**
 * Get public statistics for landing page (no auth required)
 */
export const getPublicStatistics = async () => {
  try {
    const response = await api.get(STATISTICS_ENDPOINTS.PUBLIC);
    return response.data;
  } catch (error) {
    console.error('Error fetching public statistics:', error);
    throw error;
  }
};

/**
 * Get dashboard statistics (admin only)
 */
export const getDashboardStatistics = async () => {
  try {
    const response = await api.get(STATISTICS_ENDPOINTS.DASHBOARD);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    throw error;
  }
};

/**
 * Get user growth statistics (admin only)
 * @param {number} months - Number of months to fetch (default: 12)
 */
export const getUserGrowthStatistics = async (months = 12) => {
  try {
    const response = await api.get(STATISTICS_ENDPOINTS.USER_GROWTH, {
      params: { months }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user growth statistics:', error);
    throw error;
  }
};

/**
 * Get submissions by programming language (admin only)
 */
export const getSubmissionsByLanguage = async () => {
  try {
    const response = await api.get(STATISTICS_ENDPOINTS.SUBMISSIONS_BY_LANGUAGE);
    return response.data;
  } catch (error) {
    console.error('Error fetching submissions by language:', error);
    throw error;
  }
};

/**
 * Get problems by tags (admin only)
 */
export const getProblemsByTags = async () => {
  try {
    const response = await api.get(STATISTICS_ENDPOINTS.PROBLEMS_BY_TAGS);
    return response.data;
  } catch (error) {
    console.error('Error fetching problems by tags:', error);
    throw error;
  }
};