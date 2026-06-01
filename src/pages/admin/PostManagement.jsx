import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/card';
import PostTable from '../../components/admin/tables/PostTable';
import Pagination from '../../components/admin/tables/Pagination';
import SearchBar from '../../components/admin/tables/SearchBar';
import * as postService from '../../services/postService';
import { FileText, Eye, MessageSquare, TrendingUp, Plus } from 'lucide-react';
import { toast } from 'sonner';
import TablePagination from '@/components/common/TablePagination';
import PostDetailModal from '../../components/admin/posts/PostDetailModal';
import CreatePost from '../../components/home/CreatePost';

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, published, draft
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch posts list
  const fetchPosts = useCallback(async (page, search, status) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        search,
        sortBy: 'createdAt',
        order: 'desc'
      };

      if (status !== 'all') {
        params.status = status;
      }

      const response = await postService.getAdminPostsList(params);

      setPosts(response.data.posts);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages
      }));
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Không thể tải danh sách bài viết', {
        description: error.message || 'Đã có lỗi xảy ra'
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await postService.getPostStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchPosts(currentPage, searchTerm, filterStatus);
    fetchStats();
  }, [currentPage, searchTerm, filterStatus, fetchPosts, fetchStats]);

  const handleSearch = (search) => {
    setSearchTerm(search);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setCurrentPage(newPage);
  };

  const handleDeletePost = async (postId) => {
    toast.promise(
      new Promise((resolve, reject) => {
        const confirmed = window.confirm('Bạn có chắc chắn muốn xóa bài viết này?');
        if (!confirmed) {
          reject(new Error('Đã hủy'));
          return;
        }

        postService.deletePost(postId)
          .then(() => {
            fetchPosts(currentPage, searchTerm, filterStatus);
            fetchStats();
            resolve();
          })
          .catch(reject);
      }),
      {
        loading: 'Đang xóa bài viết...',
        success: 'Đã xóa bài viết thành công',
        error: (err) => err.message !== 'Đã hủy' ? 'Không thể xóa bài viết' : null,
      }
    );
  };

  const handleToggleStatus = async (postId, currentStatus) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    const actionText = newStatus === 'published' ? 'xuất bản' : 'chuyển sang nháp';

    toast.promise(
      postService.updatePostStatus(postId, newStatus)
        .then(() => {
          fetchPosts(currentPage, searchTerm, filterStatus);
          fetchStats();
        }),
      {
        loading: `Đang ${actionText} bài viết...`,
        success: `Đã ${actionText} bài viết thành công`,
        error: `Không thể ${actionText} bài viết`,
      }
    );
  };

  const handleViewDetail = (postId) => {
    setSelectedPostId(postId);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setTimeout(() => {
      setSelectedPostId(null);
    }, 300);
  };

  const handlePostCreated = (newPost) => {
    setIsCreateModalOpen(false);
    fetchPosts(currentPage, searchTerm, filterStatus);
    fetchStats();
    toast.success('Tạo bài viết thành công!', {
      description: 'Bài viết của bạn đã được tạo'
    });
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800/60 dark:to-slate-900 p-8 space-y-8 max-w-full mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-xl">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 -translate-y-20 translate-x-20"
          style={{ background: 'radial-gradient(circle, white, transparent)' }} />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full opacity-10 translate-y-12"
          style={{ background: 'radial-gradient(circle, white, transparent)' }} />
        
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Quản lý bài viết</h1>
            <p className="text-blue-100 text-base">Theo dõi, kiểm duyệt và quản lý các bài viết trên hệ thống BNOJ</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-xl font-bold backdrop-blur-sm shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            Tạo bài viết mới
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Tổng bài viết', value: stats?.totalPosts || 0, icon: FileText, iconColor: 'text-blue-500', iconBg: 'bg-blue-50 dark:bg-blue-900/30' },
          { title: 'Đã xuất bản', value: stats?.publishedPosts || 0, icon: Eye, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-50 dark:bg-emerald-900/30' },
          { title: 'Tổng bình luận', value: stats?.totalComments || 0, icon: MessageSquare, iconColor: 'text-orange-500', iconBg: 'bg-orange-50 dark:bg-orange-900/30' },
          { title: 'Tổng lượt xem', value: stats?.totalViews || 0, icon: TrendingUp, iconColor: 'text-purple-500', iconBg: 'bg-purple-50 dark:bg-purple-900/30' },
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

      {/* Posts Table Card */}
      <Card className="p-6 border border-slate-100 dark:border-slate-700/80 shadow-lg bg-white dark:bg-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Danh sách bài viết</h2>
          <div className="flex items-center space-x-4">
            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
            >
              <option value="all">Tất cả</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Nháp</option>
            </select>

            <div className="w-72">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>
        </div>

        <PostTable
          posts={posts}
          loading={loading}
          onDeletePost={handleDeletePost}
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

      {isDetailModalOpen && (
        <PostDetailModal
          postId={selectedPostId}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
        />
      )}

      {isCreateModalOpen && (
        <CreatePost 
          forceOpen={true}
          onPostCreated={handlePostCreated}
          onCancel={handleCloseCreateModal}
        />
      )}
    </div>
  );
};

export default PostManagement;