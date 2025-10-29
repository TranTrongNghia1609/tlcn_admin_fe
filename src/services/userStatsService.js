import api from '../utils/api';
import { USER_STATS_ENDPOINTS } from '../config/endpoints';

export const userStatsService = {
  // Lấy thống kê tổng quan
  getOverviewStats: async () => {
    try {
      const response = await api.get(USER_STATS_ENDPOINTS.OVERVIEW);
      return response.data;
    } catch (error) {
      console.error('Error fetching overview stats:', error);
      throw error.response?.data || error;
    }
  },

  // Lấy thống kê theo vai trò
  getRoleStats: async () => {
    try {
      const response = await api.get(USER_STATS_ENDPOINTS.ROLES);
      return response.data;
    } catch (error) {
      console.error('Error fetching role stats:', error);
      throw error.response?.data || error;
    }
  },

  // Lấy người dùng mới nhất
  getRecentUsers: async (limit = 10) => {
    try {
      const response = await api.get(USER_STATS_ENDPOINTS.RECENT, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent users:', error);
      throw error.response?.data || error;
    }
  },

  // Lấy thống kê theo tháng
  getMonthlyStats: async () => {
    try {
      const response = await api.get(USER_STATS_ENDPOINTS.MONTHLY);
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
      throw error.response?.data || error;
    }
  },

  // Lấy thống kê theo ngày
  getDailyStats: async (days = 30) => {
    try {
      const response = await api.get(USER_STATS_ENDPOINTS.DAILY, {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching daily stats:', error);
      throw error.response?.data || error;
    }
  },

  // Lấy thống kê theo khoảng thời gian tùy chỉnh
  getCustomPeriodStats: async (startDate, endDate) => {
    try {
      const response = await api.get(USER_STATS_ENDPOINTS.CUSTOM, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching custom period stats:', error);
      throw error.response?.data || error;
    }
  }
};