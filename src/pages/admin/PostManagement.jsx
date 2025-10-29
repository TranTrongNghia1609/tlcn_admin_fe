import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/card';
import PostTable from '../../components/admin/tables/PostTable';
import Pagination from '../../components/admin/tables/Pagination';
import SearchBar from '../../components/admin/tables/SearchBar';
import * as postService from '../../services/postService';
import { FileText, Eye, MessageSquare, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

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
    console.log('View detail for post:', postId);
    toast.info('Tính năng đang phát triển', {
      description: 'Tính năng xem chi tiết bài viết sẽ sớm được bổ sung'
    });
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý bài viết</h1>
          <p className="text-gray-600 mt-2 text-lg">Theo dõi và quản lý bài viết trên hệ thống</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 hover:shadow-lg transition-all duration-200 border-0 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {stats?.totalPosts || 0}
          </h3>
          <p className="text-sm text-gray-600 font-medium">Tổng bài viết</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-200 border-0 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-100 text-green-600">
              <Eye className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {stats?.publishedPosts || 0}
          </h3>
          <p className="text-sm text-gray-600 font-medium">Đã xuất bản</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-200 border-0 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
              <MessageSquare className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {stats?.totalComments || 0}
          </h3>
          <p className="text-sm text-gray-600 font-medium">Tổng bình luận</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-200 border-0 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {stats?.totalViews || 0}
          </h3>
          <p className="text-sm text-gray-600 font-medium">Tổng lượt xem</p>
        </Card>
      </div>

      {/* Posts Table Card */}
      <Card className="p-6 border-0 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Danh sách bài viết</h2>
          <div className="flex items-center space-x-4">
            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        {pagination.total > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default PostManagement;