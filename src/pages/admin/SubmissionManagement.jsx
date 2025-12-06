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
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý bài nộp</h1>
          <p className="text-gray-600 mt-2 text-lg">Theo dõi và quản lý bài nộp trên hệ thống</p>
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
          {stats?.totalSubmissions || 0}
            </h3>
            <p className="text-sm text-gray-600 font-medium">Tổng bài nộp</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-200 border-0 shadow-md">
            <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-green-100 text-green-600">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
          {stats?.acSubmissions || 0}
            </h3>
            <p className="text-sm text-gray-600 font-medium">Bài nộp thành công</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-200 border-0 shadow-md">
            <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
            <XCircle className="h-6 w-6" />
          </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
          {stats?.waSubmission || 0}
            </h3>
            <p className="text-sm text-gray-600 font-medium">Bài nộp sai</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-200 border-0 shadow-md">
            <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-red-100 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
          {stats?.otherSubmission || 0}
            </h3>
            <p className="text-sm text-gray-600 font-medium">Trạng thái còn lại</p>
          </Card>
        </div>
        
          {showFilterModal && (
            <div 
              className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 h-full"
              onClick={() => setShowFilterModal(false)}
            />
          )}

          {/* Filter Modal - Always rendered, controlled by CSS */}
          <div className={`fixed top-0 right-0 z-50 min-w-[350px] h-[100vh] transition-transform duration-300 ${showFilterModal ? 'translate-x-0' : 'translate-x-full'}`}
            >
            <SubmissionFilter 
              currentFilter={filter}
              onClose={() => setShowFilterModal(false)}
              onFilterChange={handleSearchByFilter}
            />
          </div>
          
          {/* Posts Table Card */}
      <Card className="p-6 border-0 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Danh sách bài nộp</h2>
          <div className='cursor-pointer p-2 rounded-md hover:bg-gray-100 transition-colors'
              onClick={() => {setShowFilterModal(true);}}
          >
            <ListFilterPlus />
          </div>
        </div>

        <SubmissionTable
          submissions={submissions}
          loading={loading}
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

export default SubmissionManagement;