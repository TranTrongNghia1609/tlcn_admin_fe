import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Code2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Trophy,
  Book,
  BookOpen,
  ExternalLink,
  Shield,
  Sun,
  Moon,
  Bot
} from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import logo from '@/assets/logo.png';
import { goToTeacherSite, goToUserSite } from '@/utils/siteNavigation';
import { useTheme } from '@/context/ThemeContext';

// ─── Sidebar Skeleton ───────────────────────────────────────────────────────
const SidebarSkeleton = ({ isCollapsed }) => (
  <div
    className={`fixed left-0 top-0 h-screen transition-all duration-300 z-50 ${isCollapsed ? 'w-20' : 'w-64'
      }`}
    style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}
  >
    <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
      {!isCollapsed ? (
        <div className="flex items-center space-x-2 flex-1">
          <Skeleton className="w-8 h-8 rounded-lg bg-white/10" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-24 bg-white/10" />
            <Skeleton className="h-3 w-32 bg-white/10" />
          </div>
        </div>
      ) : (
        <Skeleton className="w-8 h-8 rounded-lg mx-auto bg-white/10" />
      )}
      <Skeleton className="h-8 w-8 rounded bg-white/10" />
    </div>
    <div className="p-4 border-b border-white/10">
      <div className="flex items-center space-x-3">
        <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
        {!isCollapsed && (
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-24 bg-white/10" />
            <Skeleton className="h-3 w-32 bg-white/10" />
          </div>
        )}
      </div>
    </div>
    <nav className="flex-1 overflow-y-auto p-3 space-y-1">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center space-x-3 px-3 py-2.5 rounded-xl">
          <Skeleton className="h-5 w-5 rounded bg-white/10" />
          {!isCollapsed && <Skeleton className="h-4 flex-1 bg-white/10" />}
        </div>
      ))}
    </nav>
  </div>
);

// ─── Menu Item ───────────────────────────────────────────────────────────────
const MenuItem = ({ item, isCollapsed, active, isDark }) => {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      title={isCollapsed ? item.title : undefined}
      style={active ? {
        background: isDark
          ? 'linear-gradient(135deg, rgba(99,102,241,0.35) 0%, rgba(139,92,246,0.25) 100%)'
          : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
        boxShadow: isDark
          ? '0 0 0 1px rgba(139,92,246,0.4), 0 4px 15px rgba(99,102,241,0.2)'
          : '0 4px 12px rgba(37,99,235,0.25), 0 0 0 1px rgba(37,99,235,0.4)',
      } : {}}
      className={`
        relative flex items-center py-2.5 rounded-xl
        transition-all duration-200 group overflow-hidden
        ${isCollapsed ? 'justify-center px-0 w-full' : 'px-3'}
        ${active
          ? 'text-white font-semibold'
          : isDark
            ? 'text-slate-400 hover:text-white hover:bg-white/8'
            : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/70'
        }
      `}
    >
      {/* active left indicator */}
      {active && !isCollapsed && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
          style={{
            background: isDark
              ? 'linear-gradient(180deg,#818cf8,#a78bfa)'
              : 'linear-gradient(180deg,#ffffff,#dbeafe)',
          }}
        />
      )}

      <Icon
        className={`h-[18px] w-[18px] flex-shrink-0 transition-colors duration-200 ${active
            ? isDark
              ? 'text-indigo-300'
              : 'text-white'
            : isDark
              ? 'text-slate-500 group-hover:text-slate-300'
              : 'text-slate-400 group-hover:text-blue-500'
          }`}
      />

      {!isCollapsed && (
        <>
          <span className="ml-3 flex-1 text-sm font-medium truncate">
            {item.title}
          </span>
          {item.badge && (
            <span className={`ml-auto px-2 py-0.5 text-[11px] font-semibold rounded-full border ${active
                ? 'bg-white/20 text-white border-white/30'
                : isDark
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  : 'bg-blue-100 text-blue-600 border-blue-200'
              }`}>
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
};

// ─── Section Label ─────────────────────────────────────────────────────────
const SectionLabel = ({ label, isCollapsed, isDark }) => {
  if (isCollapsed) return <div className={`my-2 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`} />;
  return (
    <p className={`px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest select-none ${isDark ? 'text-slate-500' : 'text-slate-400'
      }`}>
      {label}
    </p>
  );
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar = ({ isCollapsed, setIsCollapsed, loading = false }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      goToUserSite('/?action=logout', false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuGroups = [
    {
      label: 'Tổng quan',
      items: [
        { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      ],
    },
    {
      label: 'Quản lý',
      items: [
        { title: 'Người dùng',  icon: Users,         path: '/users' },
        { title: 'Bài viết',    icon: FileText,       path: '/posts' },
        { title: 'Bài tập',     icon: Code2,          path: '/problems' },
        { title: 'Kỳ thi',      icon: Trophy,         path: '/contests' },
        { title: 'Bài nộp',     icon: Book,           path: '/submissions' },
        { title: 'Solution',    icon: BookOpen,       path: '/solutions' },
        { title: 'Bình luận',   icon: MessageSquare,  path: '/comments' },
        { title: 'AI Testcases',icon: Bot,            path: '/ai-testcases' },
      ],
    },
  ];

  const isActive = (path) => location.pathname === path;

  if (loading) return <SidebarSkeleton isCollapsed={isCollapsed} />;

  const avatarLetter = user?.userName?.charAt(0).toUpperCase() || 'A';
  const avatarUrl = user?.avatar
    ? user.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.userName || user?.fullName || 'Admin')}&background=6366f1&color=fff&size=40&rounded=true`;

  // ── Theme-aware styles ───────────────────────────────────────────────────
  const sidebarBg = isDark
    ? 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)'
    : 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 60%, #f8fafc 100%)';
  const dividerColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(99,102,241,0.12)';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-600';
  const textHover = isDark ? 'hover:text-white hover:bg-white/8' : 'hover:text-blue-700 hover:bg-blue-50';
  const labelColor = isDark ? 'text-slate-500' : 'text-indigo-400';
  const headerBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(99,102,241,0.12)';
  const userBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(99,102,241,0.12)';

  return (
    <div
      className={`fixed left-0 top-0 h-screen flex flex-col transition-all duration-300 z-50 ${isCollapsed ? 'w-20' : 'w-64'
        }`}
      style={{ background: sidebarBg, borderRight: `1px solid ${dividerColor}` }}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <div
        className="flex items-center justify-center h-16 px-4 flex-shrink-0"
        style={{ borderBottom: `1px solid ${headerBorder}` }}
      >
        <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : 'flex-1 min-w-0'}`}>
          <div className="relative flex-shrink-0">
            <img src={logo} alt="logo" className="w-9 h-9 object-contain flex-shrink-0" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className={`text-sm font-bold leading-tight truncate ${isDark ? 'text-white' : 'text-slate-800'
                }`}>Admin Portal</h1>
              <p className={`text-[10px] truncate ${isDark ? 'text-slate-500' : 'text-slate-400'
                }`}>BN Online Judge</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Toggle Strip ────────────────────────────────── */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? 'Mở rộng sidebar' : 'Thu nhỏ sidebar'}
        className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 w-full
          transition-all duration-200 group
          ${isDark ? 'text-slate-500 hover:text-slate-200 hover:bg-white/5 active:bg-white/10' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/80'}
          ${isCollapsed ? 'justify-center' : 'justify-between'}`}
        style={{ borderBottom: `1px solid ${dividerColor}` }}
      >
        {!isCollapsed && (
          <span className="text-[10px] font-semibold uppercase tracking-widest select-none">
            Thu nhỏ
          </span>
        )}
        <span className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors duration-200 ${isDark ? 'group-hover:bg-white/10' : 'group-hover:bg-indigo-100'
          }`}>
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </span>
      </button>

      {/* ── User Info ──────────────────────────────────── */}
      <div
        className="flex-shrink-0 px-4 py-3"
        style={{ borderBottom: `1px solid ${userBorder}` }}
      >
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={avatarUrl}
              alt={user?.userName || 'Admin'}
              className="w-9 h-9 rounded-full object-cover"
              style={{ boxShadow: '0 2px 12px rgba(99,102,241,0.4)' }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarLetter)}&background=6366f1&color=fff&size=40&rounded=true`;
              }}
            />
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 ${isDark ? 'border-slate-900' : 'border-white'
                }`}
              style={{ background: '#22c55e' }}
            />
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-semibold truncate leading-tight ${isDark ? 'text-white' : 'text-slate-800'
                }`}>
                {user?.userName || 'Admin'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                <p className={`text-[10px] truncate ${isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}>{user?.email || 'admin@bn.com'}</p>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* ── Navigation ─────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {menuGroups.map((group) => (
          <div key={group.label}>
            <SectionLabel label={group.label} isCollapsed={isCollapsed} isDark={isDark} />
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <MenuItem
                  key={item.path}
                  item={item}
                  isCollapsed={isCollapsed}
                  active={isActive(item.path)}
                  isDark={isDark}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Quick Links ────────────────────────────────── */}
      <div
        className="flex-shrink-0 px-3 py-3 space-y-1"
        style={{ borderTop: `1px solid ${dividerColor}` }}
      >
        <p className={`text-[10px] font-bold uppercase tracking-widest ${labelColor} px-3 pb-1 ${isCollapsed ? 'hidden' : ''}`}>
          Truy cập nhanh
        </p>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Chuyển sang Light mode' : 'Chuyển sang Dark mode'}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group
            ${textMuted} ${textHover}
            ${isCollapsed ? 'justify-center' : ''}`}
        >
          {isDark ? (
            <Sun className="h-4 w-4 flex-shrink-0 text-amber-400 group-hover:text-amber-300" />
          ) : (
            <Moon className="h-4 w-4 flex-shrink-0 text-indigo-500" />
          )}
          {!isCollapsed && (
            <span className="text-sm font-medium">
              {isDark ? 'Light mode' : 'Dark mode'}
            </span>
          )}
        </button>

        <button
          onClick={() => goToUserSite('/home', false)}
          title="Trang người dùng"
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group
            ${textMuted} ${textHover}
            ${isCollapsed ? 'justify-center' : ''}`}
        >
          <ExternalLink className={`h-4 w-4 flex-shrink-0 ${isDark ? 'text-blue-400 group-hover:text-blue-300' : 'text-blue-500 group-hover:text-blue-600'
            }`} />
          {!isCollapsed && <span className="text-sm font-medium">Trang người dùng</span>}
        </button>

        <button
          onClick={() => goToTeacherSite('/dashboard', false)}
          title="Trang giáo viên"
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group
            ${textMuted} ${textHover}
            ${isCollapsed ? 'justify-center' : ''}`}
        >
          <ExternalLink className={`h-4 w-4 flex-shrink-0 ${isDark ? 'text-emerald-400 group-hover:text-emerald-300' : 'text-emerald-500 group-hover:text-emerald-600'
            }`} />
          {!isCollapsed && <span className="text-sm font-medium">Trang giáo viên</span>}
        </button>
      </div>

      {/* ── Logout ─────────────────────────────────────── */}
      <div
        className="flex-shrink-0 px-3 py-3"
        style={{ borderTop: `1px solid ${dividerColor}` }}
      >
        <button
          onClick={handleLogout}
          title="Đăng xuất"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            transition-all duration-200 group
            ${isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'}
            ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="h-4 w-4 flex-shrink-0 transition-colors" />
          {!isCollapsed && <span className="text-sm font-medium">Đăng xuất</span>}
        </button>
      </div>
    </div>
  );
};

export { SidebarSkeleton };
export default Sidebar;