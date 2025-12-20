export const AUTH_ENDPOINTS = {
  LOGIN: '/auth',
  REGISTER: '/auth/register',
  REGISTER_RESEND_OTP: '/auth/register/resend-otp',
  REGISTER_VERIFY_OTP: '/auth/register/verify-otp',
  REFRESH_TOKEN: '/auth/refresh',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',          
  FORGOT_PASSWORD_SEND_OTP: '/auth/forgot-password/send-otp',
  FORGOT_PASSWORD_VERIFY_OTP: '/auth/forgot-password/verify-otp',
  RESET_PASSWORD: '/auth/reset',
  ONBOARDING: '/auth/onboarding'
};
export const USER_ENDPOINTS = {
  UPLOAD_AVATAR: '/users/profile/avatar/upload',    
  UPDATE_PROFILE: '/users/profile/update', 
  CHECK_USERNAME: '/users/username/check',

  ADMIN_USER_LIST: '/users/admin/list',
  ADMIN_DELETE_USER: (userId) => `/users/admin/${userId}`,
  ADMIN_UPDATE_USER_STATUS: (userName) => `/users/admin/${userName}/status`,
  ADMIN_USER_DETAIL: (userName) => `/users/admin/${userName}/detail`,
  ADMIN_TIMELINE: '/users/admin/timeline',
}
export const USER_STATS_ENDPOINTS = {
  OVERVIEW: '/users/admin/stats/overview',
  ROLES: '/users/admin/stats/roles',
  RECENT: '/users/admin/stats/recent',
  MONTHLY: '/users/admin/stats/monthly',
  DAILY: '/users/admin/stats/daily',
  CUSTOM: '/users/admin/stats/custom',
};
export const PROBLEM_ENDPOINTS = {
  GET_PROLBEM_ID: (id) => `/problems/${id}`,
  STATS: '/problems/admin/stats',
  GET_ALL_ADMIN: '/problems/admin/problems',
  TOGGLE_STATUS: (id) => `/problems/admin/toggle/${id}`,
  CREATE_PROBLEM: '/problems',
  UPLOAD_TESTCASE: (id) => `/problems/upload/testcase/${id}`,
  UPDATE_PROBLEM: (id) => `/problems/${id}`,
}
export const CONTEST_ENDPOINTS = {
  GET_ALL_CONTEST: '/admin/contests',
  CREATE_CONTEST: '/admin/contests',
  UPDATE_CONTEST: (id) => `/admin/contests/${id}`,
  DELETE_CONTEST: (id) => `/admin/contests/${id}`,
  ADD_PROBLEM_TO_CONTEST: (id) => `/admin/contests/${id}/problems`,
  TOGGLE_STATUS: (id) => `/admin/contests/${id}/toggle`,
  CODE_CHECKING: '/contests/code/check',
  GET_BY_ID: (id) => `/contests/${id}`,
  STATS: '/admin/contests/stats',
}
export const POST_ENDPOINTS = {
  GET_ALL: '/posts/all',
  GET_POPULAR: '/posts/popular',
  GET_RECENT: '/posts/recent',
  GET_DETAILS: (id) => `/posts/${id}/details`,
  CREATE: '/posts/create',
  UPDATE: (id) => `/posts/${id}/update`,
  DELETE: (id) => `/posts/${id}/delete`,
  LIKE: (id) => `/posts/${id}/actions/like`,
  UNLIKE: (id) => `/posts/${id}/actions/unlike`,
  TOGGLE_LIKE: (id) => `/posts/${id}/actions/toggle-like`,
  SHARE: (id) => `/posts/${id}/actions/share`,
  VIEW: (id) => `/posts/${id}/actions/view`,
  BOOKMARK: (id) => `/posts/${id}/bookmark`,
  UNBOOKMARK: (id) => `/posts/${id}/unbookmark`,
  ADMIN_GET_POSTS: '/posts/admin/posts',
  ADMIN_GET_POST_DETAIL: (id) => `/posts/admin/posts/${id}`,
  ADMIN_DELETE_POST: (id) => `/posts/admin/posts/${id}`,
  ADMIN_UPDATE_POST_STATUS: (id) => `/posts/admin/posts/${id}/status`,
  ADMIN_POST_STATS: '/posts/admin/posts/stats',
};

export const COMMENT_ENDPOINTS = {
  CREATE: '/comments',
  GET_POST_COMMENTS: (postId) => `/comments/post/${postId}`,
  GET_COMMENT_REPLIES: (commentId) => `/comments/${commentId}/replies`,
  UPDATE: (commentId) => `/comments/${commentId}`,
  DELETE: (commentId) => `/comments/${commentId}`,
  TOGGLE_LIKE: (commentId) => `/comments/${commentId}/like`,
  GET_BY_ID: (commentId) => `/comments/${commentId}`
};

export const UPLOAD_ENDPOINTS = {
  POST_IMAGES_MULTIPLE: '/upload/posts/multiple',
  POST_IMAGE_SINGLE: '/upload/posts/single',
  POST_IMAGES_GET: (postId) => `/upload/posts/${postId}/images`,
  AVATAR: '/upload/avatar'
};

export const SUBMISSION_ENDPOINTS = {
  CREATE_SUBMISSION: '/submissions',
  GET_SUBMISSION_BY_ID: (submissionId) => `/submissions/${submissionId}`,
  GET_SUBMISSIONS_ADMIN: '/admin/submissions',
  GET_SUBMISSION_STATS: '/admin/submissions/stats',
  JUDGE_SUBMISSION: (id) => `/submissions/${id}/judge`,
  STATS: '/admin/submissions/stats',
  ALL_STATUS_STATS: '/admin/submissions/statistics/all-status',

}
export const STATISTICS_ENDPOINTS = {
  PUBLIC: '/statistics/public',
  DASHBOARD: '/statistics/dashboard',
  USER_GROWTH: '/statistics/user-growth',
  SUBMISSIONS_BY_LANGUAGE: '/statistics/submissions-by-language',
  PROBLEMS_BY_TAGS: '/statistics/problems-by-tags',
};