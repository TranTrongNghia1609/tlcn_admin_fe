import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { addProblemToContest, codeChecking, createContest, updateContest } from '@/services/contestService';
import ProblemContest from '@/components/admin/contests/ProblemContest';
import { debounce } from 'lodash';

const CreateContest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    code: '',
    isPrivate: false,
    isActive: false
  });
  const [loading, setLoading] = useState(false);
  const [loadingCheckCode, setLoadingCheckCode] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [addedProblems, setAddedProblems] = useState([]);

  const handleCodeChange = useMemo(
    () =>
      debounce(async (code) => {
        try {
          if (code !== "") {
            await codeChecking(code);
            setLoadingCheckCode(false);
            setCodeError('');
          }
        } catch (error) {
          setCodeError('Mã kỳ thi này đã tồn tại');
          setLoadingCheckCode(false);
        }
      }, 1000),
    []
  );

  useEffect(() => {
    return () => handleCodeChange.cancel();
  }, [handleCodeChange]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'code') {
      setLoadingCheckCode(true);
      setCodeError('');
      handleCodeChange(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateContestInfo = () => {
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tên kỳ thi');
      return false;
    }
    if (!formData.code.trim()) {
      toast.error('Vui lòng nhập mã kỳ thi');
      return false;
    }
    if (codeError) {
      toast.error('Mã kỳ thi không hợp lệ');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Vui lòng nhập mô tả kỳ thi');
      return false;
    }
    if (!formData.startTime) {
      toast.error('Vui lòng chọn thời gian bắt đầu');
      return false;
    }
    if (!formData.endTime) {
      toast.error('Vui lòng chọn thời gian kết thúc');
      return false;
    }
    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      toast.error('Thời gian kết thúc phải sau thời gian bắt đầu');
      return false;
    }
    return true;
  };

  const handleSaveContest = async () => {
    if (!validateContestInfo()) return;

    setLoading(true);

    try {
      if (addedProblems.length == 0) {
        toast.error('Vui lòng thêm ít nhất 1 bài tập vào kỳ thi');
        setLoading(false);
        return;
      }
      const payload = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString()
      };

      // Create new contest
      const response = await createContest(payload);
      const contestId = response.data._id;
      // Add problems to contest
      const data = addedProblems.map((problem) => {
        return {
          problemId: problem._id,
          order: problem.order,
          point: problem.points
        };
      })
      await addProblemToContest(contestId, data);
      navigate('/contests');
      toast.success('Tạo kỳ thi thành công');
    } catch (err) {
      toast.error('Không thể tạo kỳ thi', {
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc muốn hủy? Mọi thay đổi sẽ không được lưu.')) {
      navigate('/contests');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800/60 dark:to-slate-900 p-8 space-y-6 max-w-full mx-auto text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            <ArrowLeft className="h-5 w-5 mr-2 text-slate-700 dark:text-white" />
            Quay lại
          </Button>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleSaveContest}
            disabled={loading || loadingCheckCode}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md font-bold px-6 py-2.5 transition-all duration-200"
          >
            {loading ? 'Đang lưu...' : 'Lưu kỳ thi'}
          </Button>
        </div>
      </div>

      <div className='flex items-center justify-center'>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">
          {'Tạo kỳ thi mới'}
        </h2>
      </div>

      <div className="space-y-6">
        {/* Thông tin kỳ thi */}
        <Card className="p-6 border border-slate-100 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-800 rounded-2xl">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Thông tin kỳ thi</h3>
          <div className="space-y-4">
            <div className='flex justify-between gap-6 flex-wrap md:flex-nowrap'>
              <div className='w-full md:flex-3'>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">Tên kỳ thi *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium shadow-sm"
                />
              </div>
              <div className='w-full md:flex-1'>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">Mã kỳ thi *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium shadow-sm ${codeError ? 'border-red-500 focus:ring-red-500 dark:border-red-500/60' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
                    }`}
                />
                {loadingCheckCode && (
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Đang kiểm tra...</p>
                )}
                {codeError && (
                  <p className="text-sm text-red-500 mt-1">{codeError}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">Mô tả *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">Thời gian bắt đầu *</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium shadow-sm [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">Thời gian kết thúc *</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium shadow-sm [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 mt-5">
              <label className="flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="isPrivate"
                  checked={formData.isPrivate}
                  onChange={handleChange}
                  className="mr-2 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 dark:bg-slate-900 w-4 h-4 cursor-pointer"
                />
                <span className="text-sm font-bold text-gray-700 dark:text-slate-300">Kỳ thi riêng tư</span>
              </label>

              <label className="flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="mr-2 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 dark:bg-slate-900 w-4 h-4 cursor-pointer"
                />
                <span className="text-sm font-bold text-gray-700 dark:text-slate-300">Kích hoạt</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Bài tập */}
        <Card className="p-6 border border-slate-100 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-800 rounded-2xl">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quản lý bài tập</h3>
          <ProblemContest
            contestId={null}
            onProblemUpdated={(data) => {
              setAddedProblems(data);
              console.log('Problem added:', data);
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default CreateContest;