import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import SolutionForm from '@/components/solution/SolutionForm';
import solutionService from '@/services/solutionService';
import { getProblemById } from '@/services/problemService';
import { toast } from 'sonner';

const SolutionFormPage = () => {
  const { id } = useParams(); // Get problem ID from URL
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [solutionId, setSolutionId] = useState(null);
  const [formDraft, setFormDraft] = useState(null);

  useEffect(() => {
    const initializePage = async () => {
      await loadProblemInfo();
    };

    initializePage();
  }, [id]);

  // Load problem information using ID
  const loadProblemInfo = async () => {
    try {
      setLoading(true);
      const response = await getProblemById(id);

      if (response.success && response.data) {
        const problemData = response.data;
        setProblem(problemData);

        // Check if solution exists for this problem
        await checkExistingSolution(problemData.shortId);
      } else {
        toast.error('Không tìm thấy bài tập');
        navigate('/problems');
      }
    } catch (error) {
      console.error('Error loading problem:', error);
      toast.error('Không thể tải thông tin bài tập');
      navigate('/problems');
    } finally {
      setLoading(false);
    }
  };

  // Check if solution already exists
  const checkExistingSolution = async (problemShortId) => {
    try {
      const response = await solutionService.checkSolutionExists(problemShortId);

      if (response.data.exists) {
        setSolutionId(response.data.solution._id);
        toast.info('Đang chỉnh sửa solution có sẵn');
      } else {
        // Initialize draft for new solution
        setFormDraft({
          title: `Hướng giải cho bài ${problem.name}`,
          content: '',
          approach: 'brute-force',
          complexity: { time: 'O(n)', space: 'O(1)' },
          tags: [],
          codeBlocks: [],
          problemShortId: problemShortId,
          classroomId: null,
          contestId: null
        });
      }
    } catch (error) {
      console.error('Error checking solution:', error);
      // Don't block page load if solution check fails
    }
  };

  const handleSuccess = () => {
    toast.success('Solution đã được lưu thành công!');
    navigate('/problems');
  };

  const handleCancel = () => {
    if (formDraft && !solutionId) {
      const confirmLeave = window.confirm(
        'Bạn có dữ liệu chưa lưu. Bạn có chắc muốn rời đi?'
      );
      if (!confirmLeave) return;
    }
    navigate('/problems');
  };

  const handleFormChange = (data) => {
    setFormDraft(data);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy bài tập
          </h2>
          <Button onClick={() => navigate('/problems')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}

      <div className="max-w-[1400px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>

          </div>

        </div>
      </div>
      <div className='flex items-center justify-center'>
        <h2 className="text-3xl font-bold text-gray-900">
          Tạo Giải Pháp Cho Bài Tập
        </h2>
      </div>
      {/* Form Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <Card className="p-8 shadow-lg">
          <SolutionForm
            solutionId={solutionId}
            problemShortId={problem.shortId}
            problemName={problem.name}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            onFormChange={handleFormChange}
            initialData={formDraft}
          />
        </Card>
      </div>
    </div>
  );
};

export default SolutionFormPage;