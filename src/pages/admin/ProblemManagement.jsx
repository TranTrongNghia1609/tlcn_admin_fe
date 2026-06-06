import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { FileText, Eye, BookMinus, BicepsFlexed, ListFilterPlus } from 'lucide-react';
import { toast } from 'sonner';
import { getAllProblemsByAdmin, getProblemStats, toggleProblemStatus } from '@/services/problemService';
import ProblemTable from '@/components/admin/tables/ProblemTable';
import ProblemFilter from '@/components/admin/problems/ProblemFilter';
import { Button } from '@/components/ui/button';
import TablePagination from '@/components/common/TablePagination';
import { useNavigate } from 'react-router-dom';

const ProblemManagement = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Filter state (mirrors ProblemFilter's output shape)
  const [filter, setFilter] = useState({
    name: '',
    isActive: undefined,
    hasSolution: undefined,
    dateFrom: undefined,
    dateTo: undefined,
  });
  const [showFilterModal, setShowFilterModal] = useState(false);

  const navigate = useNavigate();

  // Count active (non-default) filter fields to show badge
  const activeFilterCount = [
    filter.name,
    filter.isActive !== undefined ? '1' : '',
    filter.hasSolution !== undefined ? '1' : '',
    filter.dateFrom,
    filter.dateTo,
  ].filter(Boolean).length;

  // Fetch problems — hasSolution được backend trả về trực tiếp từ trường đã sync
  const fetchProblems = useCallback(async (page, currentFilter) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        name: currentFilter.name || undefined,
        isActive: currentFilter.isActive !== undefined ? String(currentFilter.isActive) : undefined,
        hasSolution: currentFilter.hasSolution !== undefined ? String(currentFilter.hasSolution) : undefined,
        sortBy: 'createdAt',
        order: 'desc',
        dateFrom: currentFilter.dateFrom || undefined,
        dateTo: currentFilter.dateTo || undefined,
      };

      const response = await getAllProblemsByAdmin(params);
      setProblems(response.data.content);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.totalPages
      }));
    } catch (error) {
      console.error('Error fetching problems:', error);
      toast.error('Không thể tải danh sách bài tập', {
        description: error.message || 'Đã có lỗi xảy ra'
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await getProblemStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => {
    fetchProblems(currentPage, filter);
  }, [currentPage, filter, fetchProblems]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setCurrentPage(newPage);
  };

  const handleToggleStatus = async (problemId, current) => {
    const newStatus = !current;
    const actionText = newStatus ? 'Hiện' : 'Ẩn';
    toast.promise(
      toggleProblemStatus(problemId).then(() => {
        setProblems(prev =>
          prev.map(p => p._id === problemId ? { ...p, isActive: newStatus } : p)
        );
      }),
      {
        loading: `Đang ${actionText} bài tập...`,
        success: `Đã ${actionText} bài tập thành công`,
        error: `Không thể ${actionText} bài tập`,
      }
    );
  };

  const handleViewDetail = (problemId) => {
    navigate(`/problems/${problemId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800/60 dark:to-slate-900 p-8 space-y-8 max-w-full mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-7 shadow-xl text-white">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 -translate-y-20 translate-x-20"
          style={{ background: 'radial-gradient(circle, white, transparent)' }} />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full opacity-10 translate-y-12"
          style={{ background: 'radial-gradient(circle, white, transparent)' }} />

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Quản lý bài tập</h1>
            <p className="text-emerald-100 text-base">Theo dõi, chỉnh sửa và cấu hình danh mục bài tập lập trình</p>
          </div>
          <div>
            <Button
              onClick={() => navigate('/problems/create')}
              className="px-6 py-3 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-xl font-bold backdrop-blur-sm shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Thêm bài tập mới
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Tổng bài tập', value: stats?.totalProblems || 0, icon: FileText, iconColor: 'text-blue-500', iconBg: 'bg-blue-50 dark:bg-blue-900/30' },
          { title: 'Bài tập Easy', value: stats?.easyProblems || 0, icon: Eye, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-50 dark:bg-emerald-900/30' },
          { title: 'Bài tập Medium', value: stats?.mediumProblems || 0, icon: BookMinus, iconColor: 'text-orange-500', iconBg: 'bg-orange-50 dark:bg-orange-900/30' },
          { title: 'Bài tập Hard', value: stats?.hardProblems || 0, icon: BicepsFlexed, iconColor: 'text-red-500', iconBg: 'bg-red-50 dark:bg-red-900/30' },
        ].map((c) => (
          <Card key={c.title} className="relative overflow-hidden p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-700/80 shadow-md bg-white dark:bg-slate-800 rounded-2xl">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.03] dark:opacity-[0.05] -translate-y-4 translate-x-4 bg-slate-900 dark:bg-white" />
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${c.iconBg}`}>
                <c.icon className={`h-6 w-6 ${c.iconColor}`} />
              </div>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1 tracking-tight">
              {c.value.toLocaleString()}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 font-semibold">{c.title}</p>
          </Card>
        ))}
      </div>

      {/* Backdrop */}
      {showFilterModal && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 h-full backdrop-blur-sm"
          onClick={() => setShowFilterModal(false)}
        />
      )}

      {/* Filter Panel — slide-in from right */}
      <div className={`fixed top-0 right-0 z-50 w-[400px] h-screen transition-transform duration-300 ${showFilterModal ? 'translate-x-0' : 'translate-x-full'}`}>
        <ProblemFilter
          currentFilter={filter}
          onClose={() => setShowFilterModal(false)}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Problems Table Card */}
      <Card className="p-6 border border-slate-100 dark:border-slate-700/80 shadow-lg bg-white dark:bg-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Danh sách bài tập</h2>

          {/* Filter button with active-count badge */}
          <div className="relative">
            <div
              className="cursor-pointer p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all shadow-sm flex items-center justify-center bg-white dark:bg-slate-800"
              onClick={() => setShowFilterModal(true)}
            >
              <ListFilterPlus className="h-5 w-5 text-gray-600 dark:text-slate-300" />
            </div>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                {activeFilterCount}
              </span>
            )}
          </div>
        </div>

        

        <ProblemTable
          problems={problems}
          loading={loading}
          onToggleStatus={handleToggleStatus}
          onViewDetail={handleViewDetail}
        />

        <TablePagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          maxVisiblePages={10}
        />
      </Card>
    </div>
  );
};

export default ProblemManagement;