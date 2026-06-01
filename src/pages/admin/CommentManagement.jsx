import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import CommentTable from '@/components/admin/tables/CommentTable';
import SearchBar from '@/components/admin/tables/SearchBar';
import { commentService } from '@/services/commentService';
import { toast } from 'sonner';
import {
  MessageSquare,
  Eye,
  EyeOff,
  TrendingUp,
  FileText
} from 'lucide-react';
import TablePagination from '@/components/common/TablePagination';

const CommentManagement = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [stats, setStats] = useState({
    totalComments: 0,
    visibleComments: 0,
    hiddenComments: 0,
    recentComments: 0,
    commentsByPost: 0
  });

  useEffect(() => {
    fetchComments();
  }, [currentPage, searchTerm, selectedStatus]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await commentService.getAdminComments({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: selectedStatus,
        sortBy: 'createdAt',
        order: 'desc'
      });

      setComments(response.data.comments);
      setPagination({
        limit: 10,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Không thể tải danh sách bình luận');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await commentService.getCommentStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Không thể tải thống kê');
    }
  };

  const refreshAllData = useCallback(() => {
    fetchComments();
    fetchStats();
  }, [currentPage, searchTerm, selectedStatus]);

  const handleSearch = useCallback((q) => {
    if (q !== searchTerm) {
      setSearchTerm(q);
      setCurrentPage(1);
    }
  }, [searchTerm]);

  const handleStatusFilter = useCallback((status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  }, [currentPage, pagination.totalPages]);

  const statusFilters = [
    { key: 'all', label: 'Tất cả', icon: MessageSquare, color: 'bg-gray-500' },
    { key: 'visible', label: 'Hiển thị', icon: Eye, color: 'bg-green-500' },
    { key: 'hidden', label: 'Đã ẩn', icon: EyeOff, color: 'bg-red-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800/60 dark:to-slate-900 p-8 space-y-8 max-w-[1800px] mx-auto relative">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 p-8 shadow-xl">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 -translate-y-20 translate-x-20"
          style={{ background: 'radial-gradient(circle, white, transparent)' }} />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full opacity-10 translate-y-12"
          style={{ background: 'radial-gradient(circle, white, transparent)' }} />
        
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Quản lý bình luận</h1>
            <p className="text-cyan-100 text-base">Theo dõi, kiểm duyệt và điều phối các bình luận trên hệ thống BNOJ</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Tổng bình luận', value: stats.totalComments, icon: MessageSquare, iconColor: 'text-blue-500', iconBg: 'bg-blue-50 dark:bg-blue-900/30', subtext: `${stats.recentComments} trong 7 ngày`, subColor: 'text-green-600 dark:text-green-400' },
          { title: 'Đang hiển thị', value: stats.visibleComments, icon: Eye, iconColor: 'text-green-500', iconBg: 'bg-green-50 dark:bg-green-900/30', subtext: `${stats.totalComments > 0 ? ((stats.visibleComments / stats.totalComments) * 100).toFixed(0) : 0}% tổng số`, subColor: 'text-slate-500 dark:text-slate-400' },
          { title: 'Đã ẩn', value: stats.hiddenComments, icon: EyeOff, iconColor: 'text-red-500', iconBg: 'bg-red-50 dark:bg-red-900/30', subtext: 'Bị vi phạm quy định', subColor: 'text-slate-500 dark:text-slate-400' },
          { title: 'Bài viết có bình luận', value: stats.commentsByPost || 0, icon: FileText, iconColor: 'text-orange-500', iconBg: 'bg-orange-50 dark:bg-orange-900/30', subtext: `Top ${stats.commentsByPost} bài viết`, subColor: 'text-slate-500 dark:text-slate-400' },
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
            <p className={`text-xs ${c.subColor} mt-2 font-medium flex items-center`}>
              {c.subtext}
            </p>
          </Card>
        ))}
      </div>

      {/* Comments Table Card */}
      <Card className="p-6 border border-slate-100 dark:border-slate-700/80 shadow-lg bg-white dark:bg-slate-800 rounded-2xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Danh sách bình luận</h2>
            <div className="w-72">
              <SearchBar onSearch={handleSearch} placeholder="Tìm kiếm bình luận..." />
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex gap-3 flex-wrap">
            {statusFilters.map((filter) => {
              const Icon = filter.icon;
              const isActive = selectedStatus === filter.key;
              
              let count = 0;
              if (filter.key === 'all') count = stats.totalComments;
              else if (filter.key === 'visible') count = stats.visibleComments;
              else if (filter.key === 'hidden') count = stats.hiddenComments;
              
              return (
                <button
                  key={filter.key}
                  onClick={() => handleStatusFilter(filter.key)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all shadow-sm
                    ${isActive 
                      ? `${filter.color} text-white shadow-md hover:scale-[1.02] active:scale-[0.98]` 
                      : 'bg-slate-50 dark:bg-slate-700 text-gray-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-600'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {filter.label}
                  <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-gray-600 dark:text-slate-300'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <CommentTable
            comments={comments}
            loading={loading}
            onCommentUpdated={refreshAllData}
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

export default CommentManagement;