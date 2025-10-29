import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import {
  Users,
  FileText,
  Code2,
  Trophy,
  TrendingUp,
  Activity,
  BookOpen,
  Target
} from 'lucide-react';
import TimelineSelector from '@/components/admin/charts/TimelineSelector';
import UserRegistrationChart from '@/components/admin/charts/UserRegistrationChart';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';
import { userStatsService } from '@/services/userStatsService';
import { toast } from 'sonner';

const Dashboard = () => {
  const [period, setPeriod] = useState('year');
  const { stats, timelineData, loading: analyticsLoading } = useUserAnalytics(period);
  
  // State cho thống kê tổng quan
  const [overviewStats, setOverviewStats] = useState({
    totalUsers: 0,
    totalProblems: 0,
    totalExams: 0,
    totalSubmissions: 0,
    newUsersThisMonth: 0,
    activeUsers: 0,
    growthRate: 0
  });
  
  // State cho người dùng hoạt động gần đây
  const [recentUsers, setRecentUsers] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch overview stats
  useEffect(() => {
    fetchOverviewStats();
    fetchRecentUsers();
  }, []);

  const fetchOverviewStats = async () => {
    try {
      setLoadingStats(true);
      
      // Gọi API thống kê người dùng
      const userStatsResponse = await userStatsService.getOverviewStats();
      
      // TODO: Thêm API calls cho problems và exams
      // const problemsResponse = await problemService.getStats();
      // const examsResponse = await examService.getStats();
      
      if (userStatsResponse.success) {
        setOverviewStats({
          totalUsers: userStatsResponse.data.totalUsers,
          totalProblems: 0, // TODO: Cập nhật khi có API
          totalExams: 0, // TODO: Cập nhật khi có API
          totalSubmissions: 0, // TODO: Cập nhật khi có API
          newUsersThisMonth: userStatsResponse.data.newUsersThisMonth,
          activeUsers: userStatsResponse.data.totalActive,
          growthRate: userStatsResponse.data.growthRate
        });
      }
    } catch (error) {
      console.error('Error fetching overview stats:', error);
      toast.error('Không thể tải thống kê tổng quan');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const response = await userStatsService.getRecentUsers(5);
      
      if (response.success) {
        setRecentUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching recent users:', error);
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      pink: 'bg-pink-100 text-pink-600'
    };
    return colors[color] || colors.blue;
  };

  const formatGrowthRate = (rate) => {
    if (typeof rate === 'string') {
      return rate;
    }
    return rate > 0 ? `+${rate}%` : `${rate}%`;
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Tổng quan hoạt động của hệ thống</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users Card */}
        <Card className="p-6 hover:shadow-lg transition-all duration-200 border-0 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${getColorClasses('blue')}`}>
              <Users className="h-6 w-6" />
            </div>
            <span className={`text-xs font-semibold ${
              parseFloat(overviewStats.growthRate) >= 0 
                ? 'text-green-600 bg-green-50' 
                : 'text-red-600 bg-red-50'
            } px-2 py-1 rounded-full`}>
              {formatGrowthRate(overviewStats.growthRate)}
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {loadingStats ? (
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            ) : (
              overviewStats.totalUsers.toLocaleString()
            )}
          </h3>
          <p className="text-sm text-gray-600 font-medium">Người dùng</p>
          <p className="text-xs text-gray-500 mt-1">
            {overviewStats.activeUsers} đang hoạt động
          </p>
        </Card>

        {/* Total Problems Card */}
        <Card className="p-6 hover:shadow-lg transition-all duration-200 border-0 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${getColorClasses('green')}`}>
              <Code2 className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              Bài tập
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {loadingStats ? (
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            ) : (
              overviewStats.totalProblems.toLocaleString()
            )}
          </h3>
          <p className="text-sm text-gray-600 font-medium">Bài tập</p>
          <p className="text-xs text-gray-500 mt-1">Tổng số bài tập</p>
        </Card>

        {/* Total Exams Card */}
        <Card className="p-6 hover:shadow-lg transition-all duration-200 border-0 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${getColorClasses('purple')}`}>
              <Trophy className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              Kỳ thi
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {loadingStats ? (
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            ) : (
              overviewStats.totalExams.toLocaleString()
            )}
          </h3>
          <p className="text-sm text-gray-600 font-medium">Kỳ thi</p>
          <p className="text-xs text-gray-500 mt-1">Đã tổ chức</p>
        </Card>

        {/* Total Submissions Card */}
        <Card className="p-6 hover:shadow-lg transition-all duration-200 border-0 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${getColorClasses('orange')}`}>
              <Target className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              Lượt nộp
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {loadingStats ? (
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            ) : (
              overviewStats.totalSubmissions.toLocaleString()
            )}
          </h3>
          <p className="text-sm text-gray-600 font-medium">Lượt nộp bài</p>
          <p className="text-xs text-gray-500 mt-1">Tổng submissions</p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* User Registration Chart - 7 columns */}
        <Card className="lg:col-span-7 p-6 border-0 shadow-md flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Người dùng mới</h3>
              <p className="text-sm text-gray-500 mt-1">Thống kê đăng ký theo thời gian</p>
            </div>
            <TimelineSelector 
              selectedPeriod={period} 
              onPeriodChange={setPeriod} 
            />
          </div>
          
          {/* Mini Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalUsers || overviewStats.totalUsers}
              </p>
              <p className="text-xs text-gray-500 mt-1">Tổng</p>
            </div>
            <div className="text-center border-l border-gray-200">
              <p className="text-2xl font-bold text-green-600">
                {overviewStats.newUsersThisMonth}
              </p>
              <p className="text-xs text-gray-500 mt-1">Tháng này</p>
            </div>
            <div className="text-center border-l border-gray-200">
              <p className="text-2xl font-bold text-blue-600">
                {formatGrowthRate(overviewStats.growthRate)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Tăng trưởng</p>
            </div>
          </div>

          {/* Chart - với flex-1 để tự động fill */}
          <div className="flex-1 min-h-[300px]">
            <UserRegistrationChart 
              data={timelineData} 
              period={period} 
              loading={analyticsLoading} 
            />
          </div>
        </Card>

        {/* Placeholder for another chart - 3 columns */}
        <Card className="lg:col-span-3 p-6 border-0 shadow-md flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Submissions</h3>
              <p className="text-sm text-gray-500 mt-1">Lượt nộp bài</p>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg min-h-[300px]">
            <div className="text-center text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">Biểu đồ sẽ được thêm vào</p>
            </div>
          </div>
        </Card>
      </div>
      {/* Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <Card className="p-6 border-0 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Người dùng mới
            </h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Chưa có người dùng mới</p>
              </div>
            ) : (
              recentUsers.map((user) => (
                <div key={user._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex-shrink-0">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.userName}
                        className="w-9 h-9 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                        {user.userName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.fullName || user.userName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-700'
                      : user.role === 'teacher'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role === 'admin' ? 'Admin' : user.role === 'teacher' ? 'Giáo viên' : 'User'}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="p-6 border-0 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Thống kê nhanh
            </h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Người dùng hoạt động</span>
              <span className="text-base font-bold text-green-600">
                {loadingStats ? '...' : overviewStats.activeUsers}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Bài tập mới tháng này</span>
              <span className="text-base font-bold text-blue-600">
                {loadingStats ? '...' : 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Kỳ thi đang diễn ra</span>
              <span className="text-base font-bold text-purple-600">
                {loadingStats ? '...' : 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Submissions hôm nay</span>
              <span className="text-base font-bold text-orange-600">
                {loadingStats ? '...' : 0}
              </span>
            </div>
          </div>
        </Card>

        {/* System Health or Another Widget */}
        <Card className="p-6 border-0 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Hoạt động hệ thống
            </h3>
            <BookOpen className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-700">Database</span>
                <span className="text-xs text-green-600 font-semibold">Online</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-700">Judge Server</span>
                <span className="text-xs text-green-600 font-semibold">Running</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">API Response</span>
                <span className="text-xs text-blue-600 font-semibold">~45ms</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">Uptime</span>
                <span className="text-xs text-blue-600 font-semibold">99.9%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;