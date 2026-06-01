import { useState } from 'react'
import { BrowserRouter as Router } from 'react-router-dom';

import { AuthModalProvider } from './context/AuthModalContext';
import { UserProvider } from './context/UserContext';
import LoginModal from './components/auth/LoginModal';
import RegisterModal from './components/auth/RegisterModal';
import Navbar from './components/layout/Navbar';
import { PostProvider } from './context/PostContext';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingSpinner from './components/common/LoadingSpinner';
import { CommentProvider } from './context/CommentContext';
import { SocketProvider } from './context/SocketContext';
import './index.css'
import ForgotPasswordModal from './components/auth/ForgotPasswordModal';
import Footer from './components/layout/Footer';
import { ThemeProvider } from './context/ThemeContext';

const AppContent = () => {
  const { loading } = useAuth();

  // Show loading spinner khi đang check auth
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SocketProvider url={import.meta.env.VITE_SOCKET_URL}>
      <UserProvider>
        <PostProvider>
          <CommentProvider>
            <AuthModalProvider>
              <div className="min-h-screen bg-gray-50">
                <main>
                  <AppRoutes />
                </main>
                {/* Modal Components - Luôn có sẵn để mở từ bất kỳ đâu */}
                <LoginModal />
                <RegisterModal />
                <ForgotPasswordModal/>
              </div>
            </AuthModalProvider>
          </CommentProvider>
        </PostProvider>
      </UserProvider>
    </SocketProvider>

  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App