import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Bot, Plus, ArrowRight, Play, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
import { aiTestCaseService } from '@/services/aiTestCaseService';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AITestCaseManagement = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        // Assuming getAllPlans returns an array or an object with content array
        const response = await aiTestCaseService.getAllPlans();;
        setPlans(Array.isArray(response) ? response : (response?.data.plans || []));
      } catch (error) {
        console.error('Error fetching plans:', error);
        // Fallback for UI testing if API not ready
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlans();
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'done':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">Hoàn thành</span>;
      case 'pending':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 border border-amber-200">Đang xử lý</span>;
      case 'failed':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-200">Thất bại</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/40 dark:from-slate-900 dark:via-indigo-900/20 dark:to-slate-900 p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-8 shadow-xl">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 -translate-y-20 translate-x-20"
          style={{ background: 'radial-gradient(circle, white, transparent)' }} />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full opacity-10 translate-y-12"
          style={{ background: 'radial-gradient(circle, white, transparent)' }} />
        
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              <Bot className="h-8 w-8" /> 
              AI Testcase Generation
            </h1>
            <p className="text-indigo-100 text-base">Sử dụng AI để sinh testcase tự động, nhanh chóng và chính xác.</p>
          </div>
          <div>
            <Button 
              onClick={() => navigate('/ai-testcases/create')}
              className="px-6 py-3 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-xl font-bold backdrop-blur-sm shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Tạo Workflow Mới
            </Button>
          </div>
        </div>
      </div>

      {/* Plans List */}
      <Card className="p-6 border border-slate-100 dark:border-slate-700/80 shadow-lg bg-white/80 backdrop-blur-md dark:bg-slate-800/80 rounded-2xl">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Danh sách Workflow Gần Đây</h2>
        
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
            <Bot className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Chưa có workflow nào</h3>
            <p className="text-slate-500 mt-1 mb-4">Tạo workflow đầu tiên để AI sinh testcase cho bài tập của bạn.</p>
            <Button onClick={() => navigate('/ai-testcases/create')} variant="outline" className="rounded-xl">
              Tạo Workflow Ngay
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div 
                key={plan._id} 
                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
                onClick={() => navigate(`/ai-testcases/${plan._id}`)}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                    <FileCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  {getStatusBadge(plan.status)}
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 line-clamp-1">
                  {plan.statement || 'Không có mô tả'}
                </h3>
                
                <div className="space-y-2 mt-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Số lượng:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{plan.numberOfTestCases || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trạng thái:</span>
                    <span className="capitalize">{plan.status}</span>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between text-indigo-600 dark:text-indigo-400 font-semibold text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  Xem chi tiết
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AITestCaseManagement;
