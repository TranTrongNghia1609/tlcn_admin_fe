import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import SearchBar from '@/components/admin/tables/SearchBar';
import { FileText, Eye, BookMinus, BicepsFlexed } from 'lucide-react';
import { toast } from 'sonner';
import { getAllProblemsByAdmin, getProblemStats, toggleProblemStatus } from '@/services/problemService';
import ProblemTable from '@/components/admin/tables/ProblemTable';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import TablePagination from '@/components/common/TablePagination';

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
  const [filterStatus, setFilterStatus] = useState('all'); // all, published, draft

  // Fetch posts list
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

      setProblems(response.data.content);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.totalPages
      }));
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Không thể tải danh sách bài tập', {
        description: error.message || 'Đã có lỗi xảy ra'
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await getProblemStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);
  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await getProblemStats();
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }
    fetch();
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

  const handleViewDetail = (postId) => {
    console.log('View detail for post:', postId);
    toast.info('Tính năng đang phát triển', {
      description: 'Tính năng xem chi tiết bài tập sẽ sớm được bổ sung'
    });
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý bài tập</h1>
          <p className="text-gray-600 mt-2 text-lg">Theo dõi và quản lý bài tập trên hệ thống</p>
        </div>
        <div>
          <Button className={'bg-gradient-to-r from-blue-600 to-purple-600'}>
            <a href="/problems/create">Thêm</a>
          </Button>
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
            {stats?.totalProblems || 0}
          </h3>
          <p className="text-sm text-gray-600 font-medium">Tổng bài tập</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-200 border-0 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-100 text-green-600">
              <Eye className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {stats?.easyProblems || 0}
          </h3>
          <p className="text-sm text-gray-600 font-medium">Bài tập Easy</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-200 border-0 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
              <BookMinus className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {stats?.mediumProblems || 0}
          </h3>
          <p className="text-sm text-gray-600 font-medium">Bài tập Medium</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-200 border-0 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-red-100 text-red-600">
              <BicepsFlexed className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {stats?.hardProblems || 0}
          </h3>
          <p className="text-sm text-gray-600 font-medium">Bài tập Hard</p>
        </Card>
      </div>

      {/* Posts Table Card */}
      <Card className="p-6 border-0 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Danh sách bài tập</h2>
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