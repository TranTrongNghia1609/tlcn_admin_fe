import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import AdminSolutionEditor from '@/components/solution/AdminSolutionEditor';
import solutionService from '@/services/solutionService';
import { getProblemById } from '@/services/problemService';
import { toast } from 'sonner';

const SolutionFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const editSolutionId = searchParams.get('edit');

  const [problem, setProblem] = useState(null);
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { problemShortId, problemName, solutionId } = location.state || {};

  useEffect(() => {
    loadData();
  }, [id, editSolutionId]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (problemShortId && problemName) {
        setProblem({ shortId: problemShortId, name: problemName });
      } else {
        const response = await getProblemById(id);
        if (response.success && response.data) {
          setProblem(response.data);
        } else {
          throw new Error('Không tìm thấy bài tập');
        }
      }

      if (editSolutionId || solutionId) {
        const solId = editSolutionId || solutionId;
        const solResponse = await solutionService.getSolutionById(solId);
        if (solResponse.success && solResponse.data) {
          setSolution(solResponse.data);
          console.log('✅ Loaded solution for edit:', solResponse.data);
        } else {
          throw new Error('Không tìm thấy solution');
        }
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(error.message || 'Không thể tải dữ liệu');
      navigate('/problems');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      setSubmitting(true);

      if (editSolutionId || solutionId) {
        const solId = editSolutionId || solutionId;
        await solutionService.updateSolution(solId, data);
        toast.success('Cập nhật solution thành công!');
      } else {
        await solutionService.createSolution(data);
        toast.success('Tạo solution thành công!');
      }

      navigate('/problems');
    } catch (error) {
      console.error('Submit solution error:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi xử lý solution');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc muốn hủy? Các thay đổi sẽ không được lưu.')) {
      navigate('/problems');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy bài tập</h2>
        <Button onClick={() => navigate('/solutions')}>Quay lại danh sách</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Chỉ có nút Quay lại */}
      <div >
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/solutions')}
            className="hover:bg-gray-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <AdminSolutionEditor
          problemShortId={problem.shortId}
          problemName={problem.name}
          solutionId={solution?._id}
          initialData={solution}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitting={submitting}
          isEditMode={!!(editSolutionId || solutionId)}
        />
      </div>
    </div>
  );
};

export default SolutionFormPage;