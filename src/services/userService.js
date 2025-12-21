import { USER_ENDPOINTS } from '../config/endpoints';
import API from '../utils/api';
export const userService ={
  uploadAvatar: async(file) => {
    try{
      const form = new FormData();
      form.append('avatar', file, file.name);
      const response = await API.post(USER_ENDPOINTS.UPLOAD_AVATAR, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });     
      console.log('Avatar updated:', response.data);
      return response.data;
    }catch (error) {
      console.error(' Update avatar error:', error);
      throw error.response?.data || { message: 'Failed to update avatar' };
  }
  },
   getProfile: async () => {
    try {      
      const response = await API.get(USER_ENDPOINTS.GET_PROFILE);
      return response.data;      
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch profile' };
    }
  },

  //  Update user profile
  updateProfile: async (profileData) => {
    try {      
      const response = await API.put(USER_ENDPOINTS.UPDATE_PROFILE, profileData);      
      return response.data;
      
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },

  checkUserName: async(username) => {
    try{
      const response = await API.get(USER_ENDPOINTS.CHECK_USERNAME, {
        params: {username: username}
      });
      return response.data;
    }
    catch (error){
      throw error.response?.data || { message: 'Failed to check' };
    }
  },
  // Lấy thống kê tổng quan người dùng 
  getAdminStats: async () => {
    try {
      const response = await API.get(USER_ENDPOINTS.ADMIN_STATS);
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error.response?.data || { message: 'Failed to fetch admin stats' };
    }
  },

  // Lấy dữ liệu biểu đồ timeline 
  getUserRegistrationTimeline: async (period = 'week') => {
    try {
      const response = await API.get(USER_ENDPOINTS.ADMIN_TIMELINE, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching timeline data:', error);
      throw error.response?.data || { message: 'Failed to fetch timeline data' };
    }
  },

  // Lấy danh sách người dùng với phân trang 
  getAdminUsersList: async (params = {}) => {
    try {
      const response = await API.get(USER_ENDPOINTS.ADMIN_USER_LIST, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users list:', error);
      throw error.response?.data || { message: 'Failed to fetch users list' };
    }
  },


  // Cập nhật trạng thái người dùng 
  updateUserStatus: async (userName, active) => {
    try {
      const response = await API.patch(
        USER_ENDPOINTS.ADMIN_UPDATE_USER_STATUS(userName), 
        { active }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error.response?.data || { message: 'Failed to update user status' };
    }
  },

  // Lấy chi tiết người dùng 
  getAdminUserDetail: async (userName) => {
    try {
      const response = await API.get(USER_ENDPOINTS.ADMIN_USER_DETAIL(userName));
      return response.data;
    } catch (error) {
      console.error('Error fetching user detail:', error);
      throw error.response?.data || { message: 'Failed to fetch user detail' };
    }
  },
  getProfileByUsername: async (username) => {
    try {      
      const response = await API.get(USER_ENDPOINTS.GET_PROFILE(username)); 
      return response.data;
      
    } catch (error) {
      console.error('Get profile by username error:', error);
      throw error.response?.data || { message: 'Failed to fetch profile' };
    }
  },
}