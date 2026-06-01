import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import SearchBar from '@/components/admin/tables/SearchBar';
import { FileText, Eye, BookMinus, BicepsFlexed } from 'lucide-react';
import { toast } from 'sonner';
import { getAllProblemsByAdmin, getProblemStats, toggleProblemStatus } from '@/services/problemService';
import solutionService from '@/services/solutionService';
import ProblemTable from '@/components/admin/tables/ProblemTable';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  // Fetch problems with solution status
  const fetchProblems = useCallback(async (page, search, status) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        name: search,
        sortBy: 'createdAt',
        order: 'desc'
      };

      const response = await getAllProblemsByAdmin(params);
      const problemsData = response.data.content;

      // Check solution exists for each problem
      const problemsWithSolution = await Promise.all(
        problemsData.map(async (problem) => {
          try {
            const solutionCheck = await solutionService.checkSolutionExists(problem.shortId);
            return {
              ...problem,
              hasSolution: solutionCheck.data.exists,
              solutionId: solutionCheck.data.solution?._id || null
            };
          } catch (error) {
            return {
              ...problem,
              hasSolution: false,
              solutionId: null
            };
          }
        })
      );

      setProblems(problemsWithSolution);
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

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchProblems(currentPage, searchTerm, filterStatus);
  }, [currentPage, searchTerm, filterStatus, fetchProblems]);

  const handleSearch = (search) => {
    setSearchTerm(search);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setCurrentPage(newPage);
  };

  const handleToggleStatus = async (problemId, current) => {
    const newStatus = current ? false : true;
    const actionText = newStatus ? 'Hiện': 'Ẩn';
    toast.promise(
      toggleProblemStatus(problemId)
        .then(() => {
          setProblems(prev =>
            prev.map(p =>
              p._id === problemId ? { ...p, isActive: newStatus } : p
            )
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 p-8 shadow-xl">
        {/* Decorative blobs */}
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

      {/* Problems Table Card */}
      <Card className="p-6 border border-slate-100 dark:border-slate-700/80 shadow-lg bg-white dark:bg-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Danh sách bài tập</h2>
          <div className="flex items-center space-x-4">
            <div className="w-72">
              <SearchBar onSearch={handleSearch} placeholder={"Tìm kiếm tên bài tập"}/>
            </div>
          </div>
        </div>

        <ProblemTable
          problems={problems}
          loading={loading}
          onToggleStatus={handleToggleStatus}
          onViewDetail={handleViewDetail}
        />

        {/* Pagination */}
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