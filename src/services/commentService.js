import api from '../utils/api';
import { COMMENT_ENDPOINTS } from '../config/endpoints';

export const commentService = {
  // Get comments for a post
  getPostComments: async (postId, page = 1, limit = 10, options = {}) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(options.sortBy && { sortBy: options.sortBy }),
        ...(options.repliesLimit !== undefined && { repliesLimit: options.repliesLimit.toString() }), 
        ...options
      });     
      const url = `${COMMENT_ENDPOINTS.GET_POST_COMMENTS(postId)}?${params.toString()}`;    
      const response = await api.get(url);             
      // Return đúng structure mà CommentContext expect
      return {
        data: {
          comments: response.data.data?.comments || [],
          pagination: response.data.data?.pagination || {},
          meta: response.data.data?.meta || {} //  Include meta info from backend
        }
      };
    } catch (error) {
      console.error('commentService.getPostComments error:', error);
      throw error;
    }
  },
  loadMoreReplies: async (commentId, skip = 0, limit = 5, includeNested = true) => {
    try {
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
        includeNested: includeNested ? 'true' : 'false'
      });

      const url = `${COMMENT_ENDPOINTS.LOAD_MORE_REPLIES(commentId)}?${params.toString()}`;
      const response = await api.get(url);

      return {
        data: response.data.data || {
          replies: [],
          pagination: {},
          meta: {}
        }
      };
    } catch (error) {
      console.error('commentService.loadMoreReplies error:', error);
      throw error;
    }
  },
  getCommentReplies: async (commentId, page = 1, limit = 5) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const url = `${COMMENT_ENDPOINTS.GET_COMMENT_REPLIES(commentId)}?${params.toString()}`;
      const response = await api.get(url);

      return {
        data: {
          replies: response.data.data?.replies || [],
          pagination: response.data.data?.pagination || {},
          meta: response.data.data?.meta || {}
        }
      };
    } catch (error) {
      console.error('commentService.getCommentReplies error:', error);
      throw error;
    }
  },

  // Create comment  
  createComment: async (commentData) => {
    try {
      const response = await api.post(COMMENT_ENDPOINTS.CREATE, commentData);
      
      // Return đúng structure
      return {
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },

  // Update comment
  updateComment: async (commentId, content) => {
    try {
      const response = await api.put(COMMENT_ENDPOINTS.UPDATE(commentId), { content });
      
      return {
        data: response.data.data || response.data
      };
    } catch (error) {
      throw error;
    }
  },

  // Delete comment
  deleteComment: async (commentId) => {
    try {
      const response = await api.delete(COMMENT_ENDPOINTS.DELETE(commentId));
      return response.data;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  // Toggle like comment
  toggleLikeComment: async (commentId) => {
    try {
      const response = await api.post(COMMENT_ENDPOINTS.TOGGLE_LIKE(commentId));
      
      return {
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error toggling comment like:', error);
      throw error;
    }
  },
  getCommentById: async (commentId) => {
    try {
      const response = await api.get(COMMENT_ENDPOINTS.GET_BY_ID(commentId));
      
      return {
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error getting comment by ID:', error);
      throw error;
    }
  },
  getAdminComments: async (params) => {
    try {
      const response = await api.get(COMMENT_ENDPOINTS.ADMIN.LIST, { params });
      
      return {
        success: response.data.success,
        data: {
          comments: response.data.data?.comments || [],
          pagination: response.data.data?.pagination || {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0
          }
        }
      };
    } catch (error) {
      console.error('Error getting admin comments:', error);
      throw error;
    }
  },

  // Get comment statistics (Admin)
  getCommentStats: async () => {
    try {
      const response = await api.get(COMMENT_ENDPOINTS.ADMIN.STATS);
      
      return {
        success: response.data.success,
        data: response.data.data || {
          totalComments: 0,
          visibleComments: 0,
          hiddenComments: 0,
          recentComments: 0,
          commentsByPost: 0
        }
      };
    } catch (error) {
      console.error('Error getting comment stats:', error);
      throw error;
    }
  },

  // Get recent comments (Admin)
  getRecentComments: async (limit = 10) => {
    try {
      const response = await api.get(COMMENT_ENDPOINTS.ADMIN.RECENT, {
        params: { limit }
      });
      
      return {
        success: response.data.success,
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Error getting recent comments:', error);
      throw error;
    }
  },

  // Get comment detail (Admin)
  getCommentDetail: async (commentId) => {
    try {
      const response = await api.get(COMMENT_ENDPOINTS.ADMIN.DETAIL(commentId));
      
      return {
        success: response.data.success,
        data: response.data.data || null
      };
    } catch (error) {
      console.error('Error getting comment detail:', error);
      throw error;
    }
  },

  // Toggle hide/unhide comment (Admin)
  toggleHideComment: async (commentId, reason) => {
    try {
      const response = await api.patch(
        COMMENT_ENDPOINTS.ADMIN.TOGGLE_HIDE(commentId),
        { reason }
      );
      
      return {
        success: response.data.success,
        data: response.data.data || null,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error toggling hide comment:', error);
      throw error;
    }
  },

  // Delete comment (Admin)
  deleteAdminComment: async (commentId) => {
    try {
      const response = await api.delete(COMMENT_ENDPOINTS.ADMIN.DELETE(commentId));
      
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error deleting admin comment:', error);
      throw error;
    }
  }
};