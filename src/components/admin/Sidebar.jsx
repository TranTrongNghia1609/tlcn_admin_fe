import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Code2,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  BarChart3,
  Trophy,
  Book,
  BookOpen
} from 'lucide-react';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import logoImage from '@/assets/logo.png';

// Sidebar Skeleton Component
const SidebarSkeleton = ({ isCollapsed }) => {
  return (
    <div
      className={`
        fixed left-0 top-0 h-screen bg-white border-r border-gray-200 
        transition-all duration-300 z-50
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Header Skeleton */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!isCollapsed ? (
          <div className="flex items-center space-x-2 flex-1">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ) : (
          <Skeleton className="w-8 h-8 rounded-lg mx-auto" />
        )}
        <Skeleton className="h-8 w-8 rounded" />
      </div>

      {/* User Info Skeleton */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          {!isCollapsed && (
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu Skeleton */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg`}
          >
            <Skeleton className="h-5 w-5 rounded" />
            {!isCollapsed && <Skeleton className="h-4 flex-1" />}
          </div>
        ))}
      </nav>

      {/* Logout Button Skeleton */}
      <div className="p-4 border-t border-gray-200">
        <div
          className={`
            w-full flex items-center space-x-3 px-3 py-2
            ${isCollapsed ? 'justify-center' : 'justify-start'}
          `}
        >
          <Skeleton className="h-5 w-5 rounded" />
          {!isCollapsed && <Skeleton className="h-4 w-20" />}
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ isCollapsed, setIsCollapsed, loading = false }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      badge: null
    },
    {
      title: 'Quản lý người dùng',
      icon: Users,
      path: '/users',
      badge: null
    },
    {
      title: 'Quản lý bài viết',
      icon: FileText,
      path: '/posts',
      badge: null
    },
    {
      title: 'Quản lý bài tập',
      icon: Code2,
      path: '/problems',
      badge: null
    },
    {
      title: 'Quản lý kỳ thi',
      icon: Trophy,
      path: '/contests',
      badge: null
    },
    {
      title: 'Quản lý bài nộp',
      icon: Book,
      path: '/submissions',
      badge: null
    },
    {
      title: 'Quản lý solution',
      icon: BookOpen,
      path: '/solutions',
      badge: null
    },
    {
      title: 'Bình luận',
      icon: MessageSquare,
      path: '/comments',
      badge: null
    },
  ];

  const isActive = (path) => location.pathname === path;

  // Show skeleton when loading
  if (loading) {
    return <SidebarSkeleton isCollapsed={isCollapsed} />;
  }

  return (
    <div
      className={`
        fixed left-0 top-0 h-screen bg-white border-r border-gray-200 
        transition-all duration-300 z-50
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <img 
              src={logoImage} 
              alt="BNOJ Logo" 
              className="w-8 h-8 object-contain"
            />
            <div>
              <h1 className="font-bold text-gray-900">Admin Portal</h1>
              <p className="text-xs text-gray-500">BN Online Judge</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <img 
            src={logoImage} 
            alt="BNOJ Logo" 
            className="w-8 h-8 object-contain mx-auto"
          />
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.userName?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.userName || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@bn.com'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center space-x-3 px-3 py-2.5 rounded-lg
                transition-all duration-200 group
                ${active
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <Icon
                className={`h-5 w-5 ${
                  active ? 'text-blue-600' : 'text-gray-500 '
                }`}
              />
              {!isCollapsed && (
                <>
                  <span className="flex-1 font-medium text-sm">{item.title}</span>
                  {item.badge && (
                    <span className={`
                      px-2 py-0.5 text-xs rounded-full
                      ${active 
                        ? 'bg-white/20 text-white' 
                        : 'bg-blue-100 text-blue-600'
                      }
                    `}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={logout}
          className={`
            w-full flex items-center space-x-3 text-red-600 hover:text-red-700 
            hover:bg-red-50 transition-colors
            ${isCollapsed ? 'justify-center px-0' : 'justify-start px-3'}
          `}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="font-medium">Đăng xuất</span>}
        </Button>
      </div>
    </div>
  );
};

export { SidebarSkeleton };
export default Sidebar;