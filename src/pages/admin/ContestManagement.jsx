import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import SearchBar from '@/components/admin/tables/SearchBar';
import { FileText, Eye, BookMinus, BicepsFlexed } from 'lucide-react';
import { toast } from 'sonner';
import { getProblemStats, toggleProblemStatus } from '@/services/problemService';
import ProblemTable from '@/components/admin/tables/ProblemTable';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import TablePagination from '@/components/common/TablePagination';
import { getAllContestsByAdmin, getContestStatistics, toggleContestStatus } from '@/services/contestService';
import ContestTable from '@/components/admin/tables/ContestTable';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ContestManagement = () => {
  const [contest, setContest] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;
  const searchTerm = searchParams.get('search') || '';
  const filterStatus = searchParams.get('status') || 'all'; // all, published, draft
  const [pagination, setPagination] = useState({
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const navigate = useNavigate();
  // Fetch posts list
  const fetchContests = useCallback(async (page, search, status) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        name: search,
        sortBy: 'createdAt',
        order: 'desc'
      };

      const response = await getAllContestsByAdmin(params);

      setContest(response.data.content);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.totalPages
      }));
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Không thể tải danh sách kỳ thi', {
        description: error.message || 'Đã có lỗi xảy ra'
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await getContestStatistics();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);
  useEffect(() => {
    fetchStats();
  }, []);
  useEffect(() => {
    fetchContests(currentPage, searchTerm, filterStatus);
  }, [currentPage, searchTerm, filterStatus, fetchContests]);

  const handleSearch = useCallback((q) => {
    const params = new URLSearchParams(searchParams);
    const currentSearch = searchParams.get('search') || '';
    if (q === currentSearch) return;
    if (q) {
      params.set('search', q);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const params = new URLSearchParams(searchParams);
    const currentPageStr = searchParams.get('page') || '1';
    if (newPage.toString() === currentPageStr) return;
    params.set('page', newPage.toString());
    setSearchParams(params);
  }, [searchParams, setSearchParams, pagination.totalPages]);

  const handleToggleStatus = async (contestId, current) => {
    const newStatus = current ? false : true;
    const actionText = newStatus ? 'hiện': 'ẩn';
    toast.promise(
      toggleContestStatus(contestId)
        .then(() => {
          setContest(prev =>
            prev.map(p =>
              p._id === contestId ? { ...p, isActive: newStatus } : p
            )
          );
        }),
      {
        loading: `Đang ${actionText} kỳ thi...`,
        success: `Đã ${actionText} kỳ thi thành công`,
        error: `Không thể ${actionText} kỳ thi`,
      }
    );
  };

  const handleViewDetail = (contestId) => {
    console.log('View detail for post:', contestId);
    navigate(`/contest/${contestId}`);
  };  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800/60 dark:to-slate-900 p-8 space-y-8 max-w-full mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-blue-600 p-7 shadow-xl text-white">
        
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Quản lý kỳ thi</h1>
            <p className="text-blue-100 text-base">Cấu hình, giám sát và vận hành các kỳ thi lập trình (Contests)</p>
          </div>
          <div>
            <Button 
              onClick={() => navigate('/contest/create')}
              className="px-6 py-3 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-xl font-bold backdrop-blur-sm shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Thêm kỳ thi mới
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Tổng kỳ thi', value: stats?.totalContests || 0, icon: FileText, iconColor: 'text-blue-500', iconBg: 'bg-blue-50 dark:bg-blue-900/30' },
          { title: 'Đang diễn ra', value: stats?.onGoingContests || 0, icon: Eye, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-50 dark:bg-emerald-900/30' },
          { title: 'Sắp diễn ra', value: stats?.upcomingContests || 0, icon: BookMinus, iconColor: 'text-orange-500', iconBg: 'bg-orange-50 dark:bg-orange-900/30' },
          { title: 'Đã kết thúc', value: stats?.pastContests || 0, icon: BicepsFlexed, iconColor: 'text-red-500', iconBg: 'bg-red-50 dark:bg-red-900/30' },
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

      {/* Contests Table Card */}
      <Card className="p-6 border border-slate-100 dark:border-slate-700/80 shadow-lg bg-white dark:bg-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Danh sách kỳ thi</h2>
          <div className="flex items-center space-x-4">
            <div className="w-72">
              <SearchBar onSearch={handleSearch} placeholder={"Tìm kiếm mã, tên kỳ thi"} initialValue={searchTerm}/>
            </div>
          </div>
        </div>

        <ContestTable
          contests={contest}
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

export default ContestManagement;