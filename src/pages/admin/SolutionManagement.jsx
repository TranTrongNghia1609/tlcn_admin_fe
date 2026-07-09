import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SolutionForm from '@/components/solution/SolutionForm';
import solutionService from '@/services/solutionService';
import { toast } from 'sonner';
import { Eye, Edit, Trash2, CheckCircle, XCircle, Search, Filter, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const SolutionManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState({
    status: 'all',
    search: ''
  });

  useEffect(() => {
    loadSolutions();
  }, [page, filter]);

  const loadSolutions = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        ...(filter.status !== 'all' && { status: filter.status }),
        ...(filter.search && { search: filter.search })
      };
      const response = await solutionService.getAllSolutions(params);

      if (response.success) {
        setSolutions(response.data.items || []);
        setTotalPages(response.data.totalPages || 1);
        setTotal(response.data.total || 0);
      } else {
        throw new Error(response.message || 'Không thể tải solutions');
      }
    } catch (error) {
      console.error('Load solutions error:', error);
      toast.error(error.message || 'Không thể tải danh sách solution');
      setSolutions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id, action, reason = null) => {
    try {
      const response = await solutionService.moderateSolution(id, action, reason);
      if (response.success) {
        toast.success(`${action === 'approve' ? 'Đã duyệt' : 'Đã từ chối'} solution`);
        loadSolutions();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa solution này?')) return;

    try {
      const response = await solutionService.deleteSolution(id);
      if (response.success) {
        toast.success('Đã xóa solution');
        loadSolutions();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error(error.message || 'Không thể xóa solution');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      published: { label: 'Published', className: 'bg-green-100 text-green-800' },
      pending_review: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
      draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800' }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const handleSearchChange = (e) => {
    setFilter({ ...filter, search: e.target.value });
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setFilter({ ...filter, status: e.target.value });
    setPage(1);
  };

  // View solution - Open modal with preview only
  const handleView = (solution) => {
    setSelectedSolution(solution);
    openViewModal();
  };

  // Edit solution - Navigate to EditMySolutionPage
  const handleEdit = (solution) => {
  const currentUserId = user?.id;
  const solutionAuthorId = solution.author?._id || solution.author?.id;

  if (currentUserId !== solutionAuthorId) {
    toast.error('Không thể chỉnh sửa solution của người khác. Bạn chỉ có thể duyệt/từ chối/xóa.', {
      duration: 4000
    });
    return;
  }

  // Get problemId from solution object
  const problemId = solution.problem?._id || solution.problem || solution.problemId;
  
  if (!problemId) {
    toast.error('Không tìm thấy thông tin bài tập');
    console.error('Missing problemId in solution:', solution);
    return;
  }

  // Navigate with problemId in URL
  navigate(`/problems/${problemId}/solution?edit=${solution._id}`, {
    state: {
      solution,
      problemShortId: solution.problemShortId,
      problemName: solution.problemName || solution.problem?.name || ''
    }
  });
};

  const openViewModal = () => {
    setShowViewModal(true);
    setTimeout(() => setIsAnimating(true), 10);
  };

  const handleCloseViewModal = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setShowViewModal(false);
      setSelectedSolution(null);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800/60 dark:to-slate-900 p-8 space-y-8 max-w-[1600px] mx-auto relative">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-blue-600 p-7 shadow-xl text-white">
        
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Quản lý Solutions</h1>
            <p className="text-violet-100 text-base">Kiểm duyệt và quản lý các bài giải thuật (solutions) của cộng đồng</p>
          </div>
          <div className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl font-bold backdrop-blur-sm shadow-md text-white text-sm">
            Tổng: <span className="text-lg font-extrabold">{total.toLocaleString()}</span> solutions
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-5 border border-slate-100 dark:border-slate-700/80 shadow-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="flex-1 p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              placeholder="Tìm kiếm theo tiêu đề hoặc bài tập..."
              value={filter.search}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              className="p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[180px] font-medium"
              value={filter.status}
              onChange={handleStatusChange}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Published</option>
              <option value="pending_review">Pending Review</option>
              <option value="rejected">Rejected</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Solutions List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500 dark:text-slate-400">Đang tải...</p>
        </div>
      ) : solutions.length === 0 ? (
        <Card className="p-12 text-center border border-slate-100 dark:border-slate-700/80 rounded-2xl bg-white dark:bg-slate-800">
          <div className="text-gray-400 dark:text-slate-500 mb-4">
            <Eye className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-slate-400 mb-2">
              Không tìm thấy solution nào
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-500">
              {filter.search || filter.status !== 'all'
                ? 'Thử thay đổi bộ lọc để xem kết quả khác'
                : 'Chưa có solution nào trong hệ thống'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {solutions.map((solution) => (
            <Card key={solution._id} className="p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border border-slate-100 dark:border-slate-700/80 shadow-md bg-white dark:bg-slate-800 rounded-2xl">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="flex-1 min-w-[280px]">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {solution.title}
                    </h3>
                    {getStatusBadge(solution.status)}
                    {solution.isFeatured && (
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                        ⭐ Featured
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                    Problem: <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {solution.problemShortId}
                    </span>
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                      {solution.approach?.split('-').map(w =>
                        w.charAt(0).toUpperCase() + w.slice(1)
                      ).join(' ')}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                      ⏱️ {solution.complexity?.time || 'N/A'}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                      💾 {solution.complexity?.space || 'N/A'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">👤 {solution.author?.userName || 'Unknown'}</span>
                    <span className="flex items-center gap-1">👍 {solution.upvoteCount || 0}</span>
                    <span className="flex items-center gap-1">👁️ {solution.viewCount || 0}</span>
                    <span className="flex items-center gap-1">💬 {solution.commentCount || 0}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {solution.status === 'pending_review' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 dark:border-green-800/60 rounded-xl cursor-pointer"
                        onClick={() => handleModerate(solution._id, 'approve')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800/60 rounded-xl cursor-pointer"
                        onClick={() => {
                          const reason = prompt('Lý do từ chối:');
                          if (reason) handleModerate(solution._id, 'reject', reason);
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Từ chối
                      </Button>
                    </>
                  )}

                  {/* View button - always available */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer"
                    onClick={() => handleView(solution)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>

                  {/* Edit button - only for own solutions */}
                  {user?.id === (solution.author?._id || solution.author?.id) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer"
                      onClick={() => handleEdit(solution)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer"
                    onClick={() => handleDelete(solution._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="rounded-xl border-slate-200 dark:border-slate-700"
          >
            ← Trước
          </Button>

          <div className="flex items-center gap-1.5">
            {[...Array(totalPages)].map((_, index) => {
              const pageNum = index + 1;
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= page - 1 && pageNum <= page + 1)
              ) {
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className={`rounded-xl ${page === pageNum ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0' : 'border-slate-200 dark:border-slate-700'}`}
                  >
                    {pageNum}
                  </Button>
                );
              } else if (pageNum === page - 2 || pageNum === page + 2) {
                return <span key={pageNum} className="px-2 dark:text-slate-400">...</span>;
              }
              return null;
            })}
          </div>

          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded-xl border-slate-200 dark:border-slate-700"
          >
            Sau →
          </Button>
        </div>
      )}

      {/* View Modal - Preview Only */}
      {showViewModal && selectedSolution && (
        <>
          {/* Backdrop */}
          <div
            className={`
              fixed inset-0 bg-black/50 z-40
              transition-opacity duration-300
              ${isAnimating ? 'opacity-100' : 'opacity-0'}
            `}
            onClick={handleCloseViewModal}
          />

          {/* Sliding Panel */}
          <div
            className={`
              fixed right-0 top-0 h-screen w-full md:w-[800px] lg:w-[1000px]
              bg-white dark:bg-slate-800 shadow-2xl z-50 overflow-y-auto
              transform transition-transform duration-500 ease-in-out
              ${isAnimating ? 'translate-x-0' : 'translate-x-full'}
            `}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  👁️ Xem Solution
                </h2>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                  Chế độ xem - Không thể chỉnh sửa
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseViewModal}
                className="hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content - Preview Only */}
            <div className="p-6">
              <SolutionForm
                solutionId={selectedSolution._id}
                problemShortId={selectedSolution.problemShortId}
                problemName={selectedSolution.problemName || ''}
                onSuccess={handleCloseViewModal}
                onCancel={handleCloseViewModal}
                viewMode={true} // Force view mode
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SolutionManagement;