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
    <div className="p-8 max-w-[1800px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý bình luận</h1>
        <p className="text-gray-600 mt-2">Theo dõi và kiểm duyệt bình luận cho bài viết</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {stats.totalComments}
          </h3>
          <p className="text-sm text-gray-600 font-medium">Tổng bình luận</p>
          <p className="text-xs text-green-600 mt-2 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            {stats.recentComments} trong 7 ngày
          </p>
        </Card>

        <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {stats.visibleComments}
          </h3>
          <p className="text-sm text-gray-600 font-medium">Đang hiển thị</p>
          <p className="text-xs text-gray-500 mt-2">
            {stats.totalComments > 0
              ? ((stats.visibleComments / stats.totalComments) * 100).toFixed(0)
              : 0}% tổng số
          </p>
        </Card>

        <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <EyeOff className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {stats.hiddenComments}
          </h3>
          <p className="text-sm text-gray-600 font-medium">Đã ẩn</p>
          <p className="text-xs text-gray-500 mt-2">Bị vi phạm quy định</p>
        </Card>

        <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {stats.commentsByPost || 0}
          </h3>
          <p className="text-sm text-gray-600 font-medium">Bài viết có bình luận</p>
          <p className="text-xs text-gray-500 mt-2">
            Top {stats.commentsByPost} bài viết
          </p>
        </Card>
      </div>

      {/* Comments Table Card */}
      <Card className="p-6 border-0 shadow-md">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Danh sách bình luận</h2>
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
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                    ${isActive 
                      ? `${filter.color} text-white shadow-md` 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
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