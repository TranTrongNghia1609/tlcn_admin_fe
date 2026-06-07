import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Terminal, Play, CheckCircle2, Loader2, Download } from 'lucide-react';

const ExecutionPhaseCard = ({
  currentPhase,
  testCaseUrl,
  isExecLoading,
  isDownloading,
  inputCode,
  onPhaseClick,
  onExecuteCode,
  onDownload
}) => {
  return (
    <Card className={`overflow-hidden border-0 shadow-2xl transition-all duration-500 ${currentPhase === 3 ? 'ring-2 ring-emerald-500 ring-offset-4 ring-offset-slate-50 dark:ring-offset-slate-950' : 'opacity-70 grayscale-[30%] hover:grayscale-0'}`}>
       <div className="bg-gradient-to-r from-slate-100 to-white dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-5 flex justify-between items-center cursor-pointer"
           onClick={onPhaseClick}>
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400 p-1.5 rounded-lg">3</span> 
          Thực thi & Tải về
        </h2>
      </div>
      
      {currentPhase === 3 && (
        <div className="p-8 bg-white dark:bg-slate-900 text-center">
          
          {!testCaseUrl && !isExecLoading && (
             <div className="max-w-md mx-auto space-y-6">
               <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Terminal className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
               </div>
               <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Thực thi Code Generator</h3>
               <p className="text-slate-500">Hệ thống sẽ chạy các file Python trong môi trường ảo, tạo ra các tệp `.in` và `.out`, và nén lại thành tệp ZIP cho bạn.</p>
               <Button onClick={onExecuteCode} className="w-full py-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-xl shadow-emerald-500/30">
                 <Play className="w-6 h-6 mr-2 fill-current" /> Bắt đầu Chạy (Execute)
               </Button>
             </div>
          )}

          {isExecLoading && (
            <div className="py-16 space-y-6 max-w-md mx-auto">
               <div className="bg-slate-900 rounded-xl p-6 shadow-2xl relative overflow-hidden font-mono text-left">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-indigo-500 to-purple-500" />
                 <div className="flex gap-2 mb-4">
                   <div className="w-3 h-3 rounded-full bg-red-500" />
                   <div className="w-3 h-3 rounded-full bg-amber-500" />
                   <div className="w-3 h-3 rounded-full bg-emerald-500" />
                 </div>
                 <p className="text-emerald-400 text-sm mb-2">$ python input_generator.py</p>
                 <p className="text-slate-400 text-xs mb-2">Generating testcases...</p>
                 <p className="text-emerald-400 text-sm mb-2">$ python output_generator.py</p>
                 <p className="text-slate-400 text-xs mb-2">Solving testcases...</p>
                 <p className="text-indigo-400 text-sm animate-pulse">$ zip compress...</p>
               </div>
               <p className="font-bold text-slate-700 dark:text-slate-300">Đang biên dịch và đóng gói, vui lòng chờ...</p>
            </div>
          )}

          {testCaseUrl && !isExecLoading && (
            <div className="py-12 max-w-lg mx-auto bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-900/20 dark:to-slate-900 rounded-3xl border border-emerald-100 dark:border-emerald-800/50 shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/40">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Hoàn tất xuất sắc!</h3>
              <p className="text-slate-500 mb-8 px-6">Bộ testcase đã được tạo thành công và sẵn sàng để tải về.</p>
              
              <div className="px-8">
                <Button
                  onClick={onDownload}
                  disabled={isDownloading}
                  className="w-full py-6 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-base transition-transform hover:scale-105 active:scale-95"
                >
                  {isDownloading
                    ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang lấy link...</>
                    : <><Download className="w-5 h-5 mr-2" /> Tải về tệp TestCases (ZIP)</>}
                </Button>
              </div>
            </div>
          )}

        </div>
      )}
    </Card>
  );
};

export default ExecutionPhaseCard;
