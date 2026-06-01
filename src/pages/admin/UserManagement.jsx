import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '../../components/ui/skeleton';
import UserTable from '../../components/admin/tables/UserTable';
import SearchBar from '../../components/admin/tables/SearchBar';
import { userService } from '../../services/userService';
import { userStatsService } from '../../services/userStatsService';
import { toast } from 'sonner';
import {
  Users, GraduationCap, Shield, TrendingUp, Activity,
  UserCheck, ChevronRight, Search, Filter
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import TablePagination from '@/components/common/TablePagination';

// ─── Skeleton Components ──────────────────────────────────────────────────────
const StatCardSkeleton = () => (
  <div className="relative overflow-hidden rounded-2xl p-6 shadow-lg bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse">
    <div className="h-10 w-10 rounded-xl bg-white/30 mb-4" />
    <div className="h-9 w-20 bg-white/30 rounded-lg mb-2" />
    <div className="h-4 w-28 bg-white/20 rounded mb-1" />
    <div className="h-3 w-24 bg-white/20 rounded" />
  </div>
);

const ChartSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700 p-6 animate-pulse">
    <div className="h-5 w-36 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
    <div className="flex items-center gap-6">
      <div className="w-40 h-40 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
      <div className="flex-1 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        ))}
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
    </div>
  </div>
);

const RecentUserSkeleton = () => (
  <div className="flex flex-col items-center p-4 rounded-2xl border border-slate-100 dark:border-slate-700 animate-pulse">
    <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 mb-3" />
    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
    <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ limit: 10, total: 0, totalPages: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [stats, setStats] = useState({ totalUsers: 0, totalTeachers: 0, totalAdmins: 0, totalActive: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentUsersLoading, setRecentUsersLoading] = useState(true);

  const statsInitialized = useRef(false);
  const recentUsersInitialized = useRef(false);

  useEffect(() => { fetchUsers(); }, [currentPage, searchTerm, selectedRole]);

  useEffect(() => {
    if (!statsInitialized.current) { fetchStats(); statsInitialized.current = true; }
    if (!recentUsersInitialized.current) { fetchRecentUsers(); recentUsersInitialized.current = true; }
  }, []);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await userService.getAdminUsersList({
        page: currentPage, limit: 10, search: searchTerm,
        role: selectedRole === 'all' ? undefined : selectedRole,
        sortBy: 'createdAt', order: 'desc'
      });
      setUsers(response.data.users);
      setPagination({ limit: 10, total: response.data.pagination.total, totalPages: response.data.pagination.totalPages });
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng', { description: error.message || 'Đã có lỗi xảy ra' });
    } finally { setUsersLoading(false); }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await userStatsService.getOverviewStats();
      if (response.success) {
        setStats({
          totalUsers: response.data.totalUsers || 0,
          totalTeachers: response.data.totalTeachers || 0,
          totalAdmins: response.data.totalAdmins || 0,
          totalActive: response.data.totalActive || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Không thể tải thống kê');
    } finally { setStatsLoading(false); }
  };

  const fetchRecentUsers = async () => {
    try {
      setRecentUsersLoading(true);
      const response = await userStatsService.getRecentUsers(5);
      if (response.success) setRecentUsers(response.data);
    } catch (error) {
      console.error('Error fetching recent users:', error);
    } finally { setRecentUsersLoading(false); }
  };

  const refreshAllData = useCallback(() => {
    fetchUsers(); fetchStats(); fetchRecentUsers();
  }, [currentPage, searchTerm, selectedRole]);

  const handleSearch = useCallback((q) => {
    if (q !== searchTerm) { setSearchTerm(q); setCurrentPage(1); }
  }, [searchTerm]);

  const handleRoleFilter = useCallback((role) => { setSelectedRole(role); setCurrentPage(1); }, []);

  const handlePageChange = useCallback((newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    if (newPage !== currentPage) setCurrentPage(newPage);
  }, [currentPage, pagination.totalPages]);

  const handleViewUserDetail = useCallback((userName) => { navigate(`/profile/${userName}`); }, [navigate]);

  const handleDeleteUser = useCallback(async (userId) => {
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa người dùng này?');
    if (!confirmed) return;
    toast.promise(
      userService.deleteUser(userId).then(() => { refreshAllData(); }),
      { loading: 'Đang xóa người dùng...', success: 'Đã xóa người dùng thành công', error: 'Không thể xóa người dùng' }
    );
  }, [refreshAllData]);

  const regularUsers = useMemo(() => stats.totalUsers - stats.totalTeachers - stats.totalAdmins, [stats]);

  const chartData = useMemo(() => {
    const total = regularUsers + stats.totalTeachers + stats.totalAdmins;
    return total > 0 ? [
      { name: 'Người dùng', value: regularUsers, color: '#6366f1', percentage: ((regularUsers / total) * 100).toFixed(0) },
      { name: 'Giáo viên', value: stats.totalTeachers, color: '#10b981', percentage: ((stats.totalTeachers / total) * 100).toFixed(0) },
      { name: 'Quản trị viên', value: stats.totalAdmins, color: '#a855f7', percentage: ((stats.totalAdmins / total) * 100).toFixed(0) },
    ].filter(i => i.value > 0) : [];
  }, [regularUsers, stats]);

  const roleFilters = [
    { key: 'all', label: 'Tất cả', icon: Users, count: stats.totalUsers, activeGrad: 'from-indigo-500 to-blue-600' },
    { key: 'user', label: 'Người dùng', icon: Users, count: regularUsers, activeGrad: 'from-slate-500 to-slate-600' },
    { key: 'teacher', label: 'Giáo viên', icon: GraduationCap, count: stats.totalTeachers, activeGrad: 'from-emerald-500 to-teal-600' },
    { key: 'admin', label: 'Quản trị viên', icon: Shield, count: stats.totalAdmins, activeGrad: 'from-purple-500 to-violet-600' },
  ];

  const statCards = [
    {
      icon: Users, label: 'Tổng người dùng', value: stats.totalUsers,
      sub: `${stats.totalActive} đang hoạt động`,
      gradient: 'from-indigo-500 to-blue-600', iconBg: 'bg-white/20'
    },
    {
      icon: GraduationCap, label: 'Giáo viên', value: stats.totalTeachers,
      sub: 'Đang giảng dạy',
      gradient: 'from-emerald-500 to-teal-600', iconBg: 'bg-white/20'
    },
    {
      icon: Shield, label: 'Quản trị viên', value: stats.totalAdmins,
      sub: 'Đang quản lý',
      gradient: 'from-purple-500 to-violet-600', iconBg: 'bg-white/20'
    },
    {
      icon: UserCheck, label: 'Đang hoạt động', value: stats.totalActive,
      sub: `${stats.totalUsers > 0 ? Math.round((stats.totalActive / stats.totalUsers) * 100) : 0}% tổng số`,
      gradient: 'from-orange-500 to-red-500', iconBg: 'bg-white/20'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-6 lg:p-8 space-y-8 max-w-[1800px] mx-auto">

        {/* ── Header ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 -translate-y-20 translate-x-20"
            style={{ background: 'radial-gradient(circle, white, transparent)' }} />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 rounded-full opacity-10 translate-y-12"
            style={{ background: 'radial-gradient(circle, white, transparent)' }} />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-black text-white mb-2">Quản lý người dùng</h1>
              <p className="text-indigo-200 text-base">Theo dõi và quản lý toàn bộ người dùng trên hệ thống</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-white text-sm font-medium">
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="flex items-center gap-2 bg-emerald-400/20 border border-emerald-400/40 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 text-sm font-semibold">{pagination.total} users</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {statsLoading
            ? [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
            : statCards.map(({ icon: Icon, label, value, sub, gradient, iconBg }) => (
              <div key={label}
                className={`relative overflow-hidden rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${gradient}`}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-8 translate-x-8"
                  style={{ background: 'rgba(255,255,255,0.4)' }} />
                <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full opacity-10 translate-y-6 -translate-x-6"
                  style={{ background: 'rgba(255,255,255,0.3)' }} />
                <div className="relative z-10">
                  <div className={`inline-flex p-3 rounded-xl ${iconBg} backdrop-blur-sm mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-3xl font-black text-white tracking-tight">{value.toLocaleString()}</p>
                  <p className="text-sm font-semibold text-white/90 mt-1">{label}</p>
                  <p className="text-xs text-white/70 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />{sub}
                  </p>
                </div>
              </div>
            ))
          }
        </div>

        {/* ── Middle Row: Chart + Recent Users ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Pie Chart */}
          {statsLoading ? <ChartSkeleton /> : (
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
                  <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Phân bố vai trò</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Cơ cấu người dùng hệ thống</p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="w-44 h-44 flex-shrink-0">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%"
                          innerRadius={42} outerRadius={68}
                          dataKey="value" paddingAngle={3}>
                          {chartData.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => `${v} người`}
                          contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 12, padding: '8px 12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-sm text-gray-400">Chưa có dữ liệu</p>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2.5">
                  {chartData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-800 dark:text-slate-200">{item.value}</span>
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-md text-white"
                          style={{ backgroundColor: item.color }}>{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/40">
                    <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">Tổng cộng</span>
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{stats.totalUsers.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Users */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Người dùng mới nhất</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Đăng ký gần đây</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2.5 py-1 rounded-full border border-purple-100 dark:border-purple-800/40">
                {recentUsers.length} người
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {recentUsersLoading
                ? [...Array(5)].map((_, i) => <RecentUserSkeleton key={i} />)
                : recentUsers.length === 0
                  ? (
                    <div className="col-span-5 text-center py-10">
                      <Users className="h-10 w-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-400 dark:text-slate-500 font-medium">Chưa có người dùng mới</p>
                    </div>
                  )
                  : recentUsers.map((user) => (
                    <div key={user._id} onClick={() => handleViewUserDetail(user.userName)}
                      className="group flex flex-col items-center p-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-600 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/20 hover:shadow-md transition-all cursor-pointer">
                      <div className="relative mb-3">
                        {user.avatar
                          ? <img src={user.avatar} alt={user.userName}
                            className="w-14 h-14 rounded-full object-cover ring-2 ring-white dark:ring-slate-700 shadow-sm group-hover:ring-indigo-300 transition-all" />
                          : <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold shadow-sm">
                            {user.userName?.charAt(0).toUpperCase()}
                          </div>
                        }
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-800" />
                      </div>
                      <p className="text-xs font-semibold text-gray-800 dark:text-slate-200 truncate w-full text-center group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {user.fullName || user.userName}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate w-full text-center mb-2">@{user.userName}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                          : user.role === 'teacher' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                            : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                        }`}>
                        {user.role === 'admin' ? 'Admin' : user.role === 'teacher' ? 'Giáo viên' : 'User'}
                      </span>
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1.5 flex items-center gap-0.5">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                      </p>
                    </div>
                  ))
              }
            </div>
          </div>
        </div>

        {/* ── Users Table ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700">
          {/* Table Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Danh sách người dùng</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                  {pagination.total > 0 ? `${pagination.total} người dùng tổng cộng` : 'Đang tải...'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-72">
                  <SearchBar onSearch={handleSearch} />
                </div>
              </div>
            </div>

            {/* Role Filter Pills */}
            <div className="mt-4 flex gap-2 flex-wrap">
              {statsLoading
                ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-9 w-32 rounded-xl" />)
                : roleFilters.map((filter) => {
                  const Icon = filter.icon;
                  const isActive = selectedRole === filter.key;
                  return (
                    <button key={filter.key} onClick={() => handleRoleFilter(filter.key)}
                      disabled={statsLoading}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                          ? `bg-gradient-to-r ${filter.activeGrad} text-white shadow-md`
                          : 'bg-slate-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        } ${statsLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {filter.label}
                      <span className={`ml-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-600 text-gray-600 dark:text-slate-300'
                        }`}>{filter.count}</span>
                    </button>
                  );
                })
              }
            </div>
          </div>

          {/* Table Body */}
          <div className="p-6 pt-4">
            <UserTable users={users} loading={usersLoading} onDeleteUser={handleDeleteUser} />
            <div className="mt-4">
              <TablePagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                maxVisiblePages={10}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserManagement;