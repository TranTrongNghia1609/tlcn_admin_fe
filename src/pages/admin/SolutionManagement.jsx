import React, { useState, useEffect, useLocation } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SolutionForm from '@/components/solution/SolutionForm';
import solutionService from '@/services/solutionService';
import { toast } from 'sonner';
import { Eye, Edit, Trash2, CheckCircle, XCircle, Search, Filter, X } from 'lucide-react';

const SolutionManagement = () => {
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false); // Để handle animation
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState({
    status: 'all',
    search: ''
  });

  // State để lưu draft form data
  const [formDraft, setFormDraft] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const location = useLocation();
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

  useEffect(() => {
    // Create new solution
    if (location.state?.createNew && location.state?.problemShortId) {
      const { problemShortId, problemName } = location.state;
      
      setFormDraft({
        title: `Solution for ${problemName}`,
        content: '',
        approach: 'brute-force',
        complexity: { time: 'O(n)', space: 'O(1)' },
        tags: [],
        codeBlocks: [],
        problemShortId: problemShortId,
        classroomId: null,
        contestId: null
      });
      
      setSelectedSolution(null);
      setIsEditMode(false);
      setShowForm(true);
      setTimeout(() => setIsAnimating(true), 10);
      
      window.history.replaceState({}, document.title);
      toast.success(`Tạo solution cho bài: ${problemName}`);
    }
    
    // Edit existing solution
    if (location.state?.editSolution && location.state?.solutionId) {
      const { solutionId, problemShortId, problemName } = location.state;
      
      // Load solution data
      loadSolutionForEdit(solutionId);
      
      window.history.replaceState({}, document.title);
      toast.info(`Chỉnh sửa solution cho bài: ${problemName}`);
    }
  }, [location]);

  const loadSolutionForEdit = async (solutionId) => {
    try {
      setLoading(true);
      const response = await solutionService.getSolutionById(solutionId);
      const solution = response.data;
      
      setSelectedSolution(solution);
      setFormDraft(null);
      setIsEditMode(true);
      setShowForm(true);
      setTimeout(() => setIsAnimating(true), 10);
    } catch (error) {
      toast.error('Không thể tải solution');
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

  // Mở form với animation
  const openForm = () => {
    setShowForm(true);
    // Delay nhỏ để trigger animation
    setTimeout(() => setIsAnimating(true), 10);
  };

  // Đóng form với animation
  const handleCloseForm = () => {
    setIsAnimating(false);
    // Đợi animation complete rồi mới unmount
    setTimeout(() => setShowForm(false), 300);
  };

  const handleFormSuccess = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setShowForm(false);
      setSelectedSolution(null);
      setFormDraft(null);
      setIsEditMode(false);
      loadSolutions();
    }, 300);
  };

  const handleCreateNew = () => {
    if (formDraft && !isEditMode) {
      const confirmDiscard = window.confirm(
        'Bạn đang có dữ liệu chưa lưu. Bạn có muốn bỏ qua và tạo mới?'
      );
      if (!confirmDiscard) {
        openForm();
        return;
      }
    }
    
    setSelectedSolution(null);
    setFormDraft(null);
    setIsEditMode(false);
    openForm();
  };

  const handleEdit = (solution) => {
    if (formDraft && !isEditMode) {
      const confirmDiscard = window.confirm(
        'Bạn đang có dữ liệu chưa lưu. Bạn có muốn bỏ qua và chỉnh sửa solution khác?'
      );
      if (!confirmDiscard) {
        openForm();
        return;
      }
    }

    setSelectedSolution(solution);
    setFormDraft(null);
    setIsEditMode(true);
    openForm();
  };

  const handleFormChange = (data) => {
    setFormDraft(data);
  };

  const handleResetForm = () => {
    const confirmReset = window.confirm(
      'Bạn có chắc muốn xóa toàn bộ dữ liệu đã nhập?'
    );
    if (confirmReset) {
      setSelectedSolution(null);
      setFormDraft(null);
      setIsEditMode(false);
      handleCloseForm();
    }
  };

  return (
    <div className="p-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Solutions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tổng: {total} solutions
            {formDraft && !showForm && (
              <span className="ml-2 text-orange-600">
                • Có dữ liệu chưa lưu
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {formDraft && !showForm && (
            <Button 
              onClick={openForm}
              variant="outline"
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              📝 Tiếp tục chỉnh sửa
            </Button>
          )}
          <Button 
            onClick={handleCreateNew}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            + Tạo Solution Mới
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tìm kiếm theo tiêu đề hoặc problem..."
              value={filter.search}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
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
          <p className="text-gray-500">Đang tải...</p>
        </div>
      ) : solutions.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Eye className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Không tìm thấy solution nào
            </h3>
            <p className="text-sm text-gray-500">
              {filter.search || filter.status !== 'all' 
                ? 'Thử thay đổi bộ lọc để xem kết quả khác'
                : 'Bắt đầu bằng cách tạo solution đầu tiên'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {solutions.map((solution) => (
            <Card key={solution._id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {solution.title}
                    </h3>
                    {getStatusBadge(solution.status)}
                    {solution.isFeatured && (
                      <Badge className="bg-purple-100 text-purple-800">
                        ⭐ Featured
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    Problem: <span className="font-medium text-blue-600">
                      {solution.problemShortId}
                    </span>
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {solution.approach?.split('-').map(w => 
                        w.charAt(0).toUpperCase() + w.slice(1)
                      ).join(' ')}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      ⏱️ {solution.complexity?.time || 'N/A'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      💾 {solution.complexity?.space || 'N/A'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>👤 {solution.author?.userName || 'Unknown'}</span>
                    <span>👍 {solution.upvoteCount || 0}</span>
                    <span>👁️ {solution.viewCount || 0}</span>
                    <span>💬 {solution.commentCount || 0}</span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  {solution.status === 'pending_review' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:bg-green-50 hover:text-green-700"
                        onClick={() => handleModerate(solution._id, 'approve')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
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
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => handleEdit(solution)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
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
          >
            ← Trước
          </Button>
          
          <div className="flex items-center gap-1">
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
                    className={page === pageNum ? 'bg-blue-600' : ''}
                  >
                    {pageNum}
                  </Button>
                );
              } else if (pageNum === page - 2 || pageNum === page + 2) {
                return <span key={pageNum} className="px-2">...</span>;
              }
              return null;
            })}
          </div>

          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Sau →
          </Button>
        </div>
      )}

      {/* Sliding Form Panel - Pure Tailwind CSS */}
      {showForm && (
        <>
          {/* Backdrop/Overlay */}
          <div
            className={`
              fixed inset-0 bg-black/50 z-40
              transition-opacity duration-300
              ${isAnimating ? 'opacity-100' : 'opacity-0'}
            `}
            onClick={handleCloseForm}
          />

          {/* Sliding Panel from Right */}
          <div
            className={`
              fixed right-0 top-0 h-screen w-full md:w-[800px] lg:w-[900px] 
              bg-white shadow-2xl z-50 overflow-y-auto
              transform transition-transform duration-500 ease-in-out
              ${isAnimating ? 'translate-x-0' : 'translate-x-full'}
            `}
          >
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedSolution ? '✏️ Chỉnh sửa Solution' : '➕ Tạo Solution Mới'}
                </h2>
                {formDraft && (
                  <p className="text-xs text-orange-600 mt-1">
                    💾 Dữ liệu được lưu tự động
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {formDraft && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetForm}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Xóa dữ liệu
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseForm}
                  className="hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <SolutionForm
                solutionId={selectedSolution?._id}
                problemShortId={selectedSolution?.problemShortId}
                onSuccess={handleFormSuccess}
                onCancel={handleCloseForm}
                onFormChange={handleFormChange}
                initialData={formDraft}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SolutionManagement;