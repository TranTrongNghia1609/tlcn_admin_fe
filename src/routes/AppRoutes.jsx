import React from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';
import Profile from '../pages/Profile';
import ProblemDetail from "../components/problems/ProblemDetail";
import WorkSpace from "@/components/workspace/WorkSpace";
import LandingPage from "@/pages/LandingPage";
import UserManagement from "@/pages/admin/UserManagement";
import AdminLayout from "@/components/layout/AdminLayout";
import NavBar from "@/components/layout/NavBar";
import { useAuth } from "@/context/AuthContext";
import PostManagement from "@/pages/admin/PostManagement";
import ProblemManagement from "@/pages/admin/ProblemManagement";
import CreateProblem from "@/pages/admin/CreateProblem";
import ContestManagement from "@/pages/admin/ContestManagement";
import CreateContest from "@/pages/admin/CreateContest";
import UpdateProblem from "@/pages/admin/UpdateProblem";
import ContestForm from "@/components/admin/contests/ContestForm";
import SubmissionManagement from "@/pages/admin/SubmissionManagement";
import Submission from "@/pages/admin/Submision";
import SolutionManagement from "@/pages/admin/SolutionManagement";
import SolutionFormPage from "@/pages/admin/SolutionFormPage";
import CommentManagement from "@/pages/admin/CommentManagement";
import ContestParticipants from "@/pages/admin/ContestParticipants";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={
          isAuthenticated && user?.role === 'admin' ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LandingPage />
          )
        } 
      />

      {/* Protected Routes - CÓ NavBar */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <>
              <NavBar />
              <main className="pt-16 lg:pt-20">
                <Home />
              </main>
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <>
              <NavBar />
              <main className="pt-16 lg:pt-20">
                <Home isShowOnboarding={true} />
              </main>
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:userName"
        element={
          <ProtectedRoute>
            <>
              <NavBar />
              <main className="pt-16 lg:pt-20">
                <Profile />
              </main>
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <>
              <NavBar />
              <main className="pt-16 lg:pt-20">
                <Profile />
              </main>
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/problem/:id"
        element={
          <ProtectedRoute>
            <>
              <NavBar />
              <main className="pt-16 lg:pt-20">
                <WorkSpace />
              </main>
            </>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/dashboard"
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }
      />

      <Route
        path="/users"
        element={
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        }
      />

      <Route
        path="/posts"
        element={
          <AdminRoute>
            <PostManagement />
          </AdminRoute>
        }
      />

      <Route
        path="/problems"
        element={
          <AdminRoute>
            <ProblemManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/comments"
        element={
          <AdminRoute>
            <CommentManagement />
          </AdminRoute>
        }
      />

      <Route
        path="/problems/create"
        element={
          <AdminRoute>
            <CreateProblem />
          </AdminRoute>
        }
      />

      <Route
        path="/problems/:id"
        element={
          <AdminRoute>
            <UpdateProblem />
          </AdminRoute>
        }
      />

      {/* Solution Routes - IMPORTANT: Đặt route cụ thể TRƯỚC route general */}
      <Route
        path="/problems/:id/solution"
        element={
          <AdminRoute>
            <SolutionFormPage />
          </AdminRoute>
        }
      />

      <Route
        path="/problems/:id/edit-solution"
        element={
          <AdminRoute>
            <SolutionFormPage />
          </AdminRoute>
        }
      />

      <Route
        path="/contests"
        element={
          <AdminRoute>
            <ContestManagement />
          </AdminRoute>
        }
      />

      <Route
        path="/solutions"
        element={
          <AdminRoute>
            <SolutionManagement />
          </AdminRoute>
        }
      />

      <Route
        path="/contest/create"
        element={
          <AdminRoute>
            <ContestForm mode="create" />
          </AdminRoute>
        }
      />

      <Route
        path="/contest/:id"
        element={
          <AdminRoute>
            <ContestForm mode="edit" />
          </AdminRoute>
        }
      />

      <Route
        path="/contest/:id/participants"
        element={
          <AdminRoute>
            <ContestParticipants/>
          </AdminRoute>
        }
      />

      <Route
        path="/submissions"
        element={
          <AdminRoute>
            <SubmissionManagement />
          </AdminRoute>
        }
      />

      <Route
        path="/submission/:id"
        element={
          <AdminRoute>
            <Submission />
          </AdminRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;