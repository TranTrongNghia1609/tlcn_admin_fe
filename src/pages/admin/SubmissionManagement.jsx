import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import SearchBar from '@/components/admin/tables/SearchBar';
import { FileText, Eye, BookMinus, BicepsFlexed, ListFilterPlus, CheckCircle, XCircle, Code, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getAllProblemsByAdmin, getProblemStats, toggleProblemStatus } from '@/services/problemService';
import ProblemTable from '@/components/admin/tables/ProblemTable';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import TablePagination from '@/components/common/TablePagination';
import { useNavigate } from 'react-router-dom';
import SubmissionFilter from '@/components/admin/submissions/SubmissionFilter';
import { getAllSubmissionsByAdmin, getSubmissionStats } from '@/services/submissionService';
import SubmissionTable from '@/components/admin/tables/SubmissionTable';

const SubmissionManagement = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filter, setFilter] = useState({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // all, published, draft
  const navigate = useNavigate();
  // Fetch posts list
  const fetchSubmissions = useCallback(async (page, filter) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        userId: filter.userId,
        contestId: filter.contestId,
        problemId: filter.problemId,
        status: filter.status,
        sortBy: 'createdAt',
        order: 'desc'
      };

      const response = await getAllSubmissionsByAdmin(params);

      setSubmissions(response.data.content);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.totalPages
      }));
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Không thể tải danh sách bài nộp', {
        description: error.message || 'Đã có lỗi xảy ra'
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await getSubmissionStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);


  useEffect(() => {
    fetchStats();
  }, []);
  useEffect(() => {
    fetchSubmissions(currentPage, filter);
  }, [currentPage, filter, fetchSubmissions]);

  const handleSearchByFilter = async (filter) => {
    try {
      setFilter(filter);
      setCurrentPage(1);
    }
    catch (error) {
      console.error('Error applying filter:', error);
      toast.error('Không thể áp dụng bộ lọc')
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setCurrentPage(newPage);
  };


  const handleViewDetail = (postId) => {
    console.log('View detail for post:', postId);
    navigate(`/problems/${postId}`);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800/60 dark:to-slate-900 p-8 space-y-8 max-w-full mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 p-8 shadow-xl">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 -translate-y-20 translate-x-20"
          style={{ background: 'radial-gradient(circle, white, transparent)' }} />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full opacity-10 translate-y-12"
          style={{ background: 'radial-gradient(circle, white, transparent)' }} />
        
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Quản lý bài nộp</h1>
            <p className="text-amber-100 text-base">Theo dõi, phân tích và giám sát kết quả các bài nộp code trên hệ thống</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Tổng bài nộp', value: stats?.totalSubmissions || 0, icon: FileText, iconColor: 'text-blue-500', iconBg: 'bg-blue-50 dark:bg-blue-900/30' },
          { title: 'Bài nộp thành công', value: stats?.acSubmissions || 0, icon: CheckCircle, iconColor: 'text-green-500', iconBg: 'bg-green-50 dark:bg-green-900/30' },
          { title: 'Bài nộp sai', value: stats?.waSubmission || 0, icon: XCircle, iconColor: 'text-orange-500', iconBg: 'bg-orange-50 dark:bg-orange-900/30' },
          { title: 'Trạng thái còn lại', value: stats?.otherSubmission || 0, icon: AlertCircle, iconColor: 'text-red-500', iconBg: 'bg-red-50 dark:bg-red-900/30' },
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

      {showFilterModal && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 h-full backdrop-blur-sm"
          onClick={() => setShowFilterModal(false)}
        />
      )}

      {/* Filter Modal - Always rendered, controlled by CSS */}
      <div className={`fixed top-0 right-0 z-50 min-w-[350px] h-[100vh] transition-transform duration-300 ${showFilterModal ? 'translate-x-0' : 'translate-x-full'}`}>
        <SubmissionFilter 
          currentFilter={filter}
          onClose={() => setShowFilterModal(false)}
          onFilterChange={handleSearchByFilter}
        />
      </div>

      {/* Submission Table Card */}
      <Card className="p-6 border border-slate-100 dark:border-slate-700/80 shadow-lg bg-white dark:bg-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Danh sách bài nộp</h2>
          <div className="cursor-pointer p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all shadow-sm flex items-center justify-center bg-white dark:bg-slate-800"
            onClick={() => setShowFilterModal(true)}
          >
            <ListFilterPlus className="h-5 w-5 text-gray-600 dark:text-slate-300" />
          </div>
        </div>

        <SubmissionTable
          submissions={submissions}
          loading={loading}
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

export default SubmissionManagement;