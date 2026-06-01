import React, { useState, useEffect } from 'react';
import {
  Users,
  Code2,
  Trophy,
  TrendingUp,
  Target,
  Zap,
  CheckCircle2,
  Server,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3
} from 'lucide-react';
import TimelineSelector from '@/components/admin/charts/TimelineSelector';
import UserRegistrationChart from '@/components/admin/charts/UserRegistrationChart';
import SubmissionStatusChart from '@/components/admin/submissions/SubmissionStatusChart';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';
import { userStatsService } from '@/services/userStatsService';
import { getDashboardStatistics } from '@/services/statisticsService';
import { toast } from 'sonner';

const Dashboard = () => {
  const [period, setPeriod] = useState('year');
  const { stats: userStats, timelineData, loading: analyticsLoading } = useUserAnalytics(period);

  const [overviewStats, setOverviewStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    growthRate: 0,
    totalProblems: 0,
    totalContests: 0,
    totalSubmissions: 0,
    acceptanceRate: 0,
    acceptedSubmissions: 0
  });

  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchAllStatistics();
  }, []);

  const fetchAllStatistics = async () => {
    try {
      setLoadingStats(true);
      const [userStatsResponse, dashboardStatsResponse] = await Promise.all([
        userStatsService.getOverviewStats(),
        getDashboardStatistics()
      ]);

      let userStatsData = { totalUsers: 0, activeUsers: 0, newUsersThisMonth: 0, growthRate: 0 };
      if (userStatsResponse.success) {
        userStatsData = {
          totalUsers: userStatsResponse.data.totalUsers,
          activeUsers: userStatsResponse.data.totalActive,
          newUsersThisMonth: userStatsResponse.data.newUsersThisMonth,
          growthRate: userStatsResponse.data.growthRate
        };
      }

      let dashboardStatsData = { totalProblems: 0, totalContests: 0, totalSubmissions: 0, acceptanceRate: 0, acceptedSubmissions: 0 };
      if (dashboardStatsResponse.success) {
        const data = dashboardStatsResponse.data;
        dashboardStatsData = {
          totalProblems: data.problems.total,
          totalContests: data.contests.total,
          totalSubmissions: data.submissions.total,
          acceptedSubmissions: data.submissions.accepted,
          acceptanceRate: parseFloat(data.submissions.acceptanceRate)
        };
      }

      setOverviewStats({ ...userStatsData, ...dashboardStatsData });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Không thể tải thống kê tổng quan');
    } finally {
      setLoadingStats(false);
    }
  };


  const formatGrowthRate = (rate) => {
    if (typeof rate === 'string') return rate;
    return rate > 0 ? `+${rate}%` : `${rate}%`;
  };

  const isPositiveGrowth = parseFloat(overviewStats.growthRate) >= 0;

  const StatCard = ({ icon: Icon, title, value, subtitle, gradient, iconBg, badge, badgeColor }) => (
    <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${gradient}`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-8 translate-x-8"
        style={{ background: 'rgba(255,255,255,0.4)' }} />
      <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full opacity-10 translate-y-6 -translate-x-6"
        style={{ background: 'rgba(255,255,255,0.3)' }} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${iconBg} backdrop-blur-sm`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          {badge && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeColor}`}>
              {loadingStats ? '...' : badge}
            </span>
          )}
        </div>

        <div className="space-y-1">
          {loadingStats ? (
            <div className="animate-pulse bg-white/30 h-9 w-24 rounded-lg" />
          ) : (
            <p className="text-3xl font-black text-white tracking-tight">{value}</p>
          )}
          <p className="text-sm font-semibold text-white/90">{title}</p>
          {subtitle && (
            <p className="text-xs text-white/70 mt-1">{loadingStats ? '...' : subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">

        {/* ── Header ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-8 shadow-2xl">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 -translate-y-20 translate-x-20"
            style={{ background: 'radial-gradient(circle, white, transparent)' }} />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full opacity-10 translate-y-12"
            style={{ background: 'radial-gradient(circle, white, transparent)' }} />

          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>

              <h1 className="text-4xl font-black text-white mb-2">Dashboard</h1>
              <p className="text-indigo-200 text-base">
                Tổng quan hoạt động hệ thống Online Judge
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-white text-sm font-medium">
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="flex items-center gap-2 bg-emerald-400/20 border border-emerald-400/40 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 text-sm font-semibold">Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard
            icon={Users}
            title="Người dùng"
            value={loadingStats ? '...' : overviewStats.totalUsers.toLocaleString()}
            subtitle={`${overviewStats.activeUsers.toLocaleString()} đang hoạt động`}
            gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            iconBg="bg-white/20"
            badge={formatGrowthRate(overviewStats.growthRate)}
            badgeColor={isPositiveGrowth ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/40" : "bg-red-400/20 text-red-300 border border-red-400/40"}
          />
          <StatCard
            icon={Code2}
            title="Bài tập"
            value={loadingStats ? '...' : overviewStats.totalProblems.toLocaleString()}
            subtitle="Tổng số bài tập trong hệ thống"
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            iconBg="bg-white/20"
            badge="Bài tập"
            badgeColor="bg-white/20 text-white border border-white/30"
          />
          <StatCard
            icon={Trophy}
            title="Kỳ thi"
            value={loadingStats ? '...' : overviewStats.totalContests.toLocaleString()}
            subtitle="Đã tổ chức trong hệ thống"
            gradient="bg-gradient-to-br from-purple-500 to-pink-600"
            iconBg="bg-white/20"
            badge="Kỳ thi"
            badgeColor="bg-white/20 text-white border border-white/30"
          />
          <StatCard
            icon={Target}
            title="Lượt nộp bài"
            value={loadingStats ? '...' : overviewStats.totalSubmissions.toLocaleString()}
            subtitle={`Tỷ lệ AC: ${loadingStats ? '...' : overviewStats.acceptanceRate.toFixed(1)}%`}
            gradient="bg-gradient-to-br from-orange-500 to-red-500"
            iconBg="bg-white/20"
            badge={loadingStats ? '...' : `${overviewStats.acceptanceRate.toFixed(1)}% AC`}
            badgeColor="bg-white/20 text-white border border-white/30"
          />
        </div>

        {/* ── Charts Row ── */}
        <div className="w-full">
          {/* User Registration Chart – full width */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
                    <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Người dùng mới</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Thống kê đăng ký theo thời gian</p>
                  </div>
                </div>
                <TimelineSelector selectedPeriod={period} onPeriodChange={setPeriod} />
              </div>

              {/* Mini Stats */}
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-700 rounded-xl border border-slate-100 dark:border-slate-600">
                  <p className="text-2xl font-black text-gray-900 dark:text-white">
                    {loadingStats ? '...' : (userStats?.totalUsers || overviewStats.totalUsers).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 font-medium">Tổng người dùng</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/40">
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {loadingStats ? '...' : overviewStats.newUsersThisMonth.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 font-medium">Tháng này</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800/40">
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                      {loadingStats ? '...' : formatGrowthRate(overviewStats.growthRate)}
                    </p>
                    {!loadingStats && (
                      isPositiveGrowth
                        ? <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                        : <ArrowDownRight className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 font-medium">Tăng trưởng</p>
                </div>
              </div>

              <div className="flex-1 min-h-[280px]">
                <UserRegistrationChart data={timelineData} period={period} loading={analyticsLoading} />
              </div>
          </div>
        </div>

        {/* ── Bottom Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Submission Status Chart – chiếm 3/5 */}
          <div className="lg:col-span-3">
            <SubmissionStatusChart />
          </div>

          {/* Right column – Quick Stats + System Health stacked */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Quick Stats */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700 p-6 flex-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-900/30">
                  <TrendingUp className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Thống kê nhanh</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Số liệu tổng quan</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Người dùng hoạt động', value: overviewStats.activeUsers.toLocaleString(), color: 'from-emerald-400 to-teal-500', textColor: 'text-emerald-600', pct: overviewStats.totalUsers > 0 ? Math.round((overviewStats.activeUsers / overviewStats.totalUsers) * 100) : 0 },
                  { label: 'Tổng lượt nộp bài', value: overviewStats.totalSubmissions.toLocaleString(), color: 'from-blue-400 to-indigo-500', textColor: 'text-blue-600', pct: 100 },
                  { label: 'Tỷ lệ Accepted (AC)', value: `${overviewStats.acceptanceRate.toFixed(1)}%`, color: 'from-green-400 to-emerald-500', textColor: 'text-green-600', pct: overviewStats.acceptanceRate },
                  { label: 'Tổng bài tập', value: overviewStats.totalProblems.toLocaleString(), color: 'from-orange-400 to-red-500', textColor: 'text-orange-600', pct: 75 },
                ].map(({ label, value, color, textColor, pct }) => (
                  <div key={label} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-slate-300 font-medium">{label}</span>
                      <span className={`text-sm font-black ${textColor}`}>
                        {loadingStats ? '...' : value}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: loadingStats ? '0%' : `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                  <Zap className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Trạng thái hệ thống</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Giám sát dịch vụ</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  { label: 'Database', icon: Database, status: 'Online', healthy: true },
                  { label: 'Judge Server', icon: Server, status: 'Running', healthy: true },
                  { label: 'API Service', icon: Zap, status: 'Active', healthy: true },
                ].map(({ label, icon: Icon, status, healthy }) => (
                  <div key={label}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors duration-200 ${
                      healthy 
                        ? 'bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' 
                        : 'bg-red-50/50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20'
                    }`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${
                        healthy ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-red-100 dark:bg-red-500/20'
                      }`}>
                        <Icon className={`h-3.5 w-3.5 ${healthy ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} />
                      </div>
                      <span className={`text-sm font-semibold ${healthy ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-800 dark:text-red-200'}`}>{label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${healthy ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                      <span className={`text-xs font-bold ${healthy ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{status}</span>
                    </div>
                  </div>
                ))}

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-black text-blue-600 dark:text-blue-400">{loadingStats ? '...' : overviewStats.totalProblems}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Problems</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm font-black text-purple-600 dark:text-purple-400">{loadingStats ? '...' : overviewStats.totalContests}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Contests</p>
                  </div>
                  <div className="text-center p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{loadingStats ? '...' : overviewStats.acceptedSubmissions.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">AC</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;