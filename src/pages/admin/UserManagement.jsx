import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import UserTable from '../../components/admin/tables/UserTable';
import SearchBar from '../../components/admin/tables/SearchBar';
import { userService } from '../../services/userService';
import { userStatsService } from '../../services/userStatsService';
import { toast } from 'sonner';
import { Users, GraduationCap, Shield, TrendingUp, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import TablePagination from '@/components/common/TablePagination';

// Skeleton Components
const StatCardSkeleton = () => (
  <Card className="p-6 border-0 shadow-md">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="w-12 h-12 rounded-xl" />
    </div>
    <Skeleton className="h-9 w-20 mb-2" />
    <Skeleton className="h-4 w-32 mb-2" />
    <Skeleton className="h-3 w-28" />
  </Card>
);

const ChartCardSkeleton = () => (
  <Card className="md:col-span-2 p-6 border-0 shadow-md">
    <Skeleton className="h-6 w-32 mb-4" />
    <div className="flex items-center gap-6">
      <Skeleton className="w-40 h-40 rounded-full" />
      <div className="flex-1 space-y-4">
        <div className="space-y-2">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-10 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  </Card>
);

const RecentUserCardSkeleton = () => (
  <div className="flex flex-col items-center p-4 rounded-lg border border-gray-100">
    <Skeleton className="w-16 h-16 rounded-full mb-3" />
    <Skeleton className="h-4 w-24 mb-1" />
    <Skeleton className="h-3 w-20 mb-2" />
    <Skeleton className="h-5 w-16 rounded-full mb-2" />
    <Skeleton className="h-3 w-12" />
  </div>
);

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalAdmins: 0,
    totalActive: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentUsersLoading, setRecentUsersLoading] = useState(true);

  const statsInitialized = useRef(false);
  const recentUsersInitialized = useRef(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, selectedRole]);

  useEffect(() => {
    if (!statsInitialized.current) {
      fetchStats();
      statsInitialized.current = true;
    }
    
    if (!recentUsersInitialized.current) {
      fetchRecentUsers();
      recentUsersInitialized.current = true;
    }
  }, []);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await userService.getAdminUsersList({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        role: selectedRole === 'all' ? undefined : selectedRole,
        sortBy: 'createdAt',
        order: 'desc'
      });

      setUsers(response.data.users);
      setPagination({
        limit: 10,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng', {
        description: error.message || 'Đã có lỗi xảy ra'
      });
    } finally {
      setUsersLoading(false);
    }
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
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      setRecentUsersLoading(true);
      const response = await userStatsService.getRecentUsers(5);
      
      if (response.success) {
        setRecentUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching recent users:', error);
    } finally {
      setRecentUsersLoading(false);
    }
  };

  const refreshAllData = useCallback(() => {
    fetchUsers();
    fetchStats();
    fetchRecentUsers();
  }, [currentPage, searchTerm, selectedRole]);

  const handleSearch = useCallback((q) => {
    if (q !== searchTerm) {
      setSearchTerm(q);
      setCurrentPage(1);
    }
  }, [searchTerm]);

  const handleRoleFilter = useCallback((role) => {
    setSelectedRole(role);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  }, [currentPage, pagination.totalPages]);

  const handleViewUserDetail = useCallback((userName) => {
    navigate(`/profile/${userName}`);
  }, [navigate]);

  const handleDeleteUser = useCallback(async (userId) => {
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa người dùng này?');
    if (!confirmed) return;

    toast.promise(
      userService.deleteUser(userId).then(() => {
        refreshAllData();
      }),
      {
        loading: 'Đang xóa người dùng...',
        success: 'Đã xóa người dùng thành công',
        error: 'Không thể xóa người dùng',
      }
    );
  }, [refreshAllData]);

  const regularUsers = useMemo(() => 
    stats.totalUsers - stats.totalTeachers - stats.totalAdmins, 
    [stats]
  );

  const chartData = useMemo(() => {
    const totalNonZero = regularUsers + stats.totalTeachers + stats.totalAdmins;
    return totalNonZero > 0 ? [
      { 
        name: 'Người dùng', 
        value: regularUsers, 
        color: '#3B82F6',
        percentage: ((regularUsers / totalNonZero) * 100).toFixed(0)
      },
      { 
        name: 'Giáo viên', 
        value: stats.totalTeachers, 
        color: '#10B981',
        percentage: ((stats.totalTeachers / totalNonZero) * 100).toFixed(0)
      },
      { 
        name: 'Quản trị viên', 
        value: stats.totalAdmins, 
        color: '#8B5CF6',
        percentage: ((stats.totalAdmins / totalNonZero) * 100).toFixed(0)
      },
    ].filter(item => item.value > 0) : [];
  }, [regularUsers, stats]);

  const roleFilters = [
    { key: 'all', label: 'Tất cả', icon: Users, color: 'bg-blue-500' },
    { key: 'user', label: 'Người dùng', icon: Users, color: 'bg-gray-500' },
    { key: 'teacher', label: 'Giáo viên', icon: GraduationCap, color: 'bg-green-500' },
    { key: 'admin', label: 'Quản trị viên', icon: Shield, color: 'bg-purple-500' },
  ];

  return (
    <div className="p-8 max-w-[1800px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
        <p className="text-gray-600 mt-2">Theo dõi và quản lý người dùng trên hệ thống</p>
      </div>

      {/* Statistics and Sidebar Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Stats Cards */}
        {statsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <ChartCardSkeleton />
          </>
        ) : (
          <>
            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totalUsers}
              </h3>
              <p className="text-sm text-gray-600 font-medium">Tổng người dùng</p>
              <p className="text-xs text-green-600 mt-2 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stats.totalActive} đang hoạt động
              </p>
            </Card>

            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <GraduationCap className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totalTeachers}
              </h3>
              <p className="text-sm text-gray-600 font-medium">Giáo viên</p>
              <p className="text-xs text-gray-500 mt-2">Đang giảng dạy</p>
            </Card>

            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totalAdmins}
              </h3>
              <p className="text-sm text-gray-600 font-medium">Quản trị viên</p>
              <p className="text-xs text-gray-500 mt-2">Đang quản lý</p>
            </Card>

            {/* Sidebar */}
            <Card className="md:col-span-2 p-6 border-0 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Phân bố vai trò</h3>
              
              <div className="flex items-center gap-6">
                {/* Chart */}
                <div className="flex-shrink-0">
                  {chartData.length > 0 ? (
                    <div className="w-40 h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={65}
                            fill="#8884d8"
                            dataKey="value"
                            paddingAngle={3}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => `${value} người`}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '12px',
                              padding: '8px 12px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="w-40 h-40 flex items-center justify-center text-gray-400">
                      <p className="text-sm">Chưa có dữ liệu</p>
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    {chartData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-sm text-gray-700">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{item.value}</span>
                          <span className="text-sm font-bold" style={{ color: item.color }}>
                            {item.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Tổng cộng</span>
                      <span className="text-lg font-bold text-blue-600">{stats.totalUsers}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Recent Users */}
      <Card className="p-6 border-0 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Người dùng mới</h3>
          <Activity className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {recentUsersLoading ? (
            [...Array(5)].map((_, index) => (
              <RecentUserCardSkeleton key={index} />
            ))
          ) : recentUsers.length === 0 ? (
            <div className="col-span-5 text-center py-8 text-gray-500">
              <p className="text-sm">Chưa có người dùng mới</p>
            </div>
          ) : (
            recentUsers.map((user) => (
              <div 
                key={user._id} 
                onClick={() => handleViewUserDetail(user.userName)}
                className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-all cursor-pointer border border-gray-100 hover:border-blue-300 hover:shadow-md"
              >
                <div className="mb-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.userName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                      {user.userName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <p className="text-sm font-medium text-gray-900 truncate w-full text-center">
                  {user.fullName || user.userName}
                </p>
                <p className="text-xs text-gray-500 truncate w-full text-center mb-2">
                  @{user.userName}
                </p>

                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  user.role === 'admin' 
                    ? 'bg-purple-100 text-purple-700'
                    : user.role === 'teacher'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {user.role === 'admin' ? 'Admin' : user.role === 'teacher' ? 'Giáo viên' : 'User'}
                </span>
                
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit'
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Users Table Card */}
      <Card className="p-6 border-0 shadow-md">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Danh sách người dùng</h2>
            <div className="w-72">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>

          {/* Role Filters */}
          {statsLoading ? (
            <div className="flex gap-3 flex-wrap">
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} className="h-10 w-32 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="flex gap-3 flex-wrap">
              {roleFilters.map((filter) => {
                const Icon = filter.icon;
                const isActive = selectedRole === filter.key;
                
                let count = 0;
                if (filter.key === 'all') count = stats.totalUsers;
                else if (filter.key === 'user') count = regularUsers;
                else if (filter.key === 'teacher') count = stats.totalTeachers;
                else if (filter.key === 'admin') count = stats.totalAdmins;
                
                return (
                  <button
                    key={filter.key}
                    onClick={() => handleRoleFilter(filter.key)}
                    disabled={statsLoading}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                      ${isActive 
                        ? `${filter.color} text-white shadow-md` 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                      ${statsLoading && 'opacity-50 cursor-not-allowed'}
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {filter.label}
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                      isActive ? 'bg-white/20' : 'bg-gray-200'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <UserTable
            users={users}
            loading={usersLoading}
            onDeleteUser={handleDeleteUser}
          />

          <TablePagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            maxVisiblePages={10}
          />
        </div>
      </Card>
    </div>
  );
};

export default UserManagement;