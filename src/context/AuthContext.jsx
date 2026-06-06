import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // OTP states
  const [pendingRegistration, setPendingRegistration] = useState(null);
  const [pendingPasswordReset, setPendingPasswordReset] = useState(null);

  const setLoggedInCookie = () => {
    const hostname = window.location.hostname;
    let domainString = "";
    if (hostname.endsWith("ball.id.vn")) {
      domainString = "; domain=.ball.id.vn";
    }
    document.cookie = `logged_in=true; path=/${domainString}; max-age=86400`;
  };

  const clearLoggedInCookie = () => {
    const hostname = window.location.hostname;
    let domainString = "";
    if (hostname.endsWith("ball.id.vn")) {
      domainString = "; domain=.ball.id.vn";
    }
    document.cookie = `logged_in=; path=/${domainString}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
  };

  useEffect(() => {
    checkAuth();

    // Listen for logout events từ interceptor
    const handleLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
      setPendingRegistration(null);
      setPendingPasswordReset(null);
    };

    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  useEffect(() => {
    const syncLogout = () => {
      const loggedInCookie = document.cookie.split('; ').find(row => row.startsWith('logged_in='));
      const isLoggedIn = loggedInCookie ? loggedInCookie.split('=')[1] === 'true' : false;
      
      if (isAuthenticated && !isLoggedIn) {
        authService.removeToken();
        setUser(null);
        setIsAuthenticated(false);
        setPendingRegistration(null);
        setPendingPasswordReset(null);
      }
    };

    window.addEventListener('focus', syncLogout);
    const interval = setInterval(syncLogout, 2000);

    return () => {
      window.removeEventListener('focus', syncLogout);
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      let token = authService.getToken();
      if (!token) {
        try {
          const refreshRes = await authService.refreshToken();
          token = refreshRes?.data?.accessToken || refreshRes?.accessToken || authService.getToken();
        } catch (e) {
          setUser(null);
          setIsAuthenticated(false);
          return;
        }
      }
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }
      // Thử lấy thông tin user (sẽ auto refresh nếu access token expired)
      const response = await authService.getCurrentUser();
      const userData = response.data?.user || response.user || response;

      if (userData && (userData.userName || userData.email)) {
        setUser(userData);
        setIsAuthenticated(true);
        setLoggedInCookie();
      } else {
        // Nếu không có user data, clear token
        authService.removeToken();
        setUser(null);
        setIsAuthenticated(false);
      }

    } catch (error) {
      console.error('CheckAuth error:', error);
      // Clear access token nếu không thể authenticate
      authService.removeToken();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };


  const login = async (credentials) => {
    try {

      const response = await authService.login(credentials);

      // Check if token was saved
      const savedToken = authService.getToken();

      const userData = response.data?.user || response.user || response;

      if (userData && (userData.userName || userData.email)) {
        setUser(userData);
        setIsAuthenticated(true);
        setLoggedInCookie();
      } else {
        console.warn('⚠️ No user data in login response, trying to fetch...');
        // Fallback: fetch user data if login successful but no user data
        if (savedToken) {
          await checkAuth();
        }
      }

      return response;
    } catch (error) {
      console.error('❌ AuthContext: Login failed:', error);
      throw error;
    }
  };

  // Register Step 1: Send registration data
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      setPendingRegistration({ email: userData.email, ...response });
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Register Step 2: Verify OTP
  const verifyRegistrationOTP = async (otp) => {
    try {
      const response = await authService.verifyRegisterOTP({
        email: otp.email,
        otp: otp.otp
      });
      setUser(response.user);
      setIsAuthenticated(true);
      setPendingRegistration(null);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Resend Registration OTP
  const resendRegistrationOTP = async (dataEmailUserName) => {
    try {

      if (!dataEmailUserName?.email || !dataEmailUserName?.userName) {
        throw new Error('Không có email để gửi OTP');
      }
      const response = await authService.resendRegisterOTP(dataEmailUserName);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Forgot Password Step 1: Send OTP
  const sendForgotPasswordOTP = async (email) => {
    try {
      const response = await authService.sendForgotPasswordOTP(email);
      setPendingPasswordReset({ email, ...response });
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Forgot Password Step 2: Verify OTP
  const verifyForgotPasswordOTP = async (otp) => {
    try {
      const response = await authService.verifyForgotPasswordOTP({
        email: pendingPasswordReset.email,
        otp: otp
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Reset Password
  const resetPassword = async (newPassword, resetToken) => {
    try {
      const response = await authService.resetPassword({
        password: newPassword,
        token: resetToken
      });
      setPendingPasswordReset(null);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const refreshUserToken = async () => {
    try {

      const response = await authService.refreshToken();

      return response;
    } catch (error) {
      console.error('❌ AuthContext: Manual refresh failed:', error);

      // Logout if refresh fails
      await logout();
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      authService.removeToken();
      clearLoggedInCookie();
      setUser(null);
      setIsAuthenticated(false);
      setPendingRegistration(null);
      setPendingPasswordReset(null);
    }
  };
  const onBoarding = async (userName) => {
    try {


      const response = await authService.onBoarding(userName);


      // ✅ Check if token was saved
      const savedToken = authService.getToken();


      const userData = response.data?.user || response.user || response.data;


      if (userData && (userData.userName || userData.email)) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.warn('⚠️ No user data in login response, trying to fetch...');
        // Fallback: fetch user data if login successful but no user data
        if (savedToken) {
          await checkAuth();
        }
      }


      return response;
    }
    catch (e) {

      throw e;
    }
  }
  const value = {
    // User state
    user,
    setUser,
    loading,
    isAuthenticated,

    // Auth methods
    login,
    logout,
    checkAuth,
    refreshUserToken,

    // Registration flow
    register,
    verifyRegistrationOTP,
    resendRegistrationOTP,
    pendingRegistration,
    onBoarding,

    // Password reset flow
    sendForgotPasswordOTP,
    verifyForgotPasswordOTP,
    resetPassword,
    pendingPasswordReset,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};