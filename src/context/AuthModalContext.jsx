import React, { createContext, useContext, useState } from 'react';

const AuthModalContext = createContext();

export const AuthModalProvider = ({ children }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  
  const [modalOptions, setModalOptions] = useState({
    prefillEmail: '',
    onSuccess: null,
    pendingAction: null
  });

  const openLogin = (options = {}) => {
    setModalOptions({
      prefillEmail: options.prefillEmail || '',
      onSuccess: options.onSuccess || null,
      pendingAction: options.pendingAction || null
    });
    setIsLoginOpen(true);
    setIsRegisterOpen(false);
    setIsForgotPasswordOpen(false);
  };

  const openRegister = (options = {}) => {
    setModalOptions({
      prefillEmail: options.prefillEmail || '',
      onSuccess: options.onSuccess || null,
      pendingAction: options.pendingAction || null
    });
    setIsRegisterOpen(true);
    setIsLoginOpen(false);
    setIsForgotPasswordOpen(false);
  };

  const openForgotPassword = (options = {}) => {
    closeModals();
    setModalOptions(options);
    setIsForgotPasswordOpen(true);
  };

  const openModal = (type, options = {}) => {
    if (type === 'login') {
      openLogin(options);
    } else if (type === 'register') {
      openRegister(options);
    } else if (type === 'forgotPassword') {
      openForgotPassword(options);
    }
  };

  const switchToRegister = () => {
    setIsRegisterOpen(true);
    setIsLoginOpen(false);
    setIsForgotPasswordOpen(false);
  };

  const switchToLogin = () => {
    setIsLoginOpen(true);
    setIsRegisterOpen(false);
    setIsForgotPasswordOpen(false);
  };

  const switchToForgotPassword = () => {
    closeModals();
    openForgotPassword(modalOptions);
  };

  const closeModals = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
    setIsForgotPasswordOpen(false);
    
    setTimeout(() => {
      setModalOptions({
        prefillEmail: '',
        onSuccess: null,
        pendingAction: null
      });
    }, 300);
  };

  return (
    <AuthModalContext.Provider value={{
      isLoginOpen,
      isRegisterOpen,
      isForgotPasswordOpen,
      modalOptions,
      openLogin,
      openRegister,
      openForgotPassword,
      openModal,
      closeModals,
      switchToRegister,
      switchToLogin,
      switchToForgotPassword
    }}>
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within AuthModalProvider');
  }
  return context;
};