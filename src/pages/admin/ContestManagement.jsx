import React, { useState, useEffect, useCallback } from 'react';
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
import { useNavigate } from 'react-router-dom';

const ContestManagement = () => {
  const [contest, setContest] = useState([]);
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

  const handleSearch = (search) => {
    setSearchTerm(search);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setCurrentPage(newPage);
  };

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
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý kỳ thi</h1>
          <p className="text-gray-600 mt-2 text-lg">Theo dõi và quản lý kỳ thi trên hệ thống</p>
        </div>
        <div className='cursor-pointer'>
          <Button className={'bg-blue-600/80 hover:bg-blue-600'}>
            <a href="/contest/create">Thêm</a>
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
            {stats?.totalContests || 0}
          </h3>
          <p className="text-sm text-gray-600 font-medium">Tổng kỳ thi</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-200 border-0 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-100 text-green-600">
              <Eye className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {stats?.onGoingContests || 0}
          </h3>
          <p className="text-sm text-gray-600 font-medium">Đang diễn ra</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-200 border-0 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
              <BookMinus className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {stats?.upcomingContests || 0}
          </h3>
          <p className="text-sm text-gray-600 font-medium">Sắp diễn ra</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-200 border-0 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-red-100 text-red-600">
              <BicepsFlexed className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {stats?.pastContests || 0}
          </h3>
          <p className="text-sm text-gray-600 font-medium">Đã kết thúc</p>
        </Card>
      </div>

      {/* Posts Table Card */}
      <Card className="p-6 border-0 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Danh sách kỳ thi</h2>
          <div className="flex items-center space-x-4">
            <div className="w-72">
              <SearchBar onSearch={handleSearch} placeholder={"Tìm kiếm mã, tên kỳ thi"}/>
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