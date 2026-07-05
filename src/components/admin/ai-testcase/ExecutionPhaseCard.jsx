import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Terminal, Play, CheckCircle2, Loader2, Download, AlertTriangle, CornerDownLeft, CircleArrowRight, History, Sparkles, Zap, ShieldCheck } from 'lucide-react';

const ExecutionPhaseCard = ({
  currentPhase,
  testCaseUrl,
  isExecLoading,
  isDownloading,
  isApplying,
  inputCode,
  execError,
  onPhaseClick,
  onExecuteCode,
  onDownload,
  onApplyTestCase,
  problemId = null,
  onUseErrorAsFeedback,
  selectedVersionNumber,
  onGoToVersions,
  isAppliedTestCase = false
}) => {
  return (
    <Card className={`overflow-hidden border-0 shadow-2xl transition-all duration-500 ${currentPhase === 3 ? 'ring-2 ring-emerald-500 ring-offset-4 ring-offset-slate-50 dark:ring-offset-slate-950' : 'opacity-70 grayscale-[30%] hover:grayscale-0'}`}>
       <div className="bg-gradient-to-r from-slate-100 to-white dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-5 flex justify-between items-center cursor-pointer"
           onClick={onPhaseClick}>
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100 flex-wrap">
          <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400 p-1.5 rounded-lg">3</span> 
          <span>Thực thi & Tải về</span>
          {selectedVersionNumber && (
            <span className="ml-1 text-xs font-semibold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
              Đang xem Version #{selectedVersionNumber}
            </span>
          )}
          {problemId && isAppliedTestCase && (
            <span className="ml-1 text-xs font-black px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-md shadow-emerald-500/20 flex items-center gap-1 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 fill-current" /> ĐANG ÁP DỤNG CHÍNH THỨC
            </span>
          )}
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
                 <p className="text-slate-400 text-xs mb-2">Validating outputs...</p>
                 <p className="text-slate-400 text-xs animate-pulse">&gt; Compressing into ZIP...</p>
               </div>
               <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 animate-pulse">Đang thực thi mã generator và tạo tệp ZIP...</p>
            </div>
          )}

          {testCaseUrl && !isExecLoading && (
            <div className="py-12 max-w-lg mx-auto bg-gradient-to-b from-emerald-50/80 to-white dark:from-emerald-950/20 dark:to-slate-900 rounded-3xl border border-emerald-200/80 dark:border-emerald-800/50 shadow-xl overflow-hidden">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/40 animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Hoàn tất xuất sắc!</h3>
              <p className="text-slate-500 px-6 mb-6">Bộ testcase đã được tạo thành công và sẵn sàng để tải về.</p>
              
              {/* Active Testcase Banner Card */}
              {problemId && isAppliedTestCase && (
                <div className="mx-8 mb-8 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 dark:from-emerald-500/20 dark:via-teal-500/20 dark:to-cyan-500/20 border-2 border-emerald-500/40 dark:border-emerald-500/60 shadow-lg shadow-emerald-500/5 relative overflow-hidden group text-left">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                  
                  <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wide bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 animate-pulse">
                      <Sparkles className="w-3.5 h-3.5 fill-current" /> ĐANG ÁP DỤNG CHÍNH THỨC
                    </span>
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-700">
                      Version #{selectedVersionNumber || 'Hiện tại'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Bài tập đang sử dụng bộ Testcase AI này!</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Hệ thống chấm bài hiện tại đang lấy trực tiếp tệp ZIP của phiên bản này để chạy chấm điểm cho các bài nộp của sinh viên.
                  </p>
                </div>
              )}
              
              <div className="px-8 pt-2 space-y-3">
                <Button
                  onClick={onDownload}
                  disabled={isDownloading}
                  className="w-full py-6 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-base transition-transform hover:scale-105 active:scale-95 shadow-md"
                >
                  {isDownloading
                    ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang lấy link...</>
                    : <><Download className="w-5 h-5 mr-2" /> Tải về tệp TestCases (ZIP)</>}
                </Button>

                {problemId && !isAppliedTestCase && (
                  <Button
                    onClick={onApplyTestCase}
                    disabled={isApplying}
                    className="w-full py-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-base shadow-xl shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 border-0"
                  >
                    {isApplying
                      ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang áp dụng vào bài tập...</>
                      : <><Zap className="w-5 h-5 mr-2 fill-current animate-bounce" /> Áp dụng Testcase này cho Bài tập</>}
                  </Button>
                )}
                
                {onGoToVersions && (
                  <Button
                    onClick={onGoToVersions}
                    variant="outline"
                    className="w-full py-6 rounded-xl border-emerald-300 dark:border-emerald-700 font-bold text-base transition-transform hover:scale-105 active:scale-95 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                  >
                    <History className="w-5 h-5 mr-2" /> Xem Lịch Sử Phiên Bản (Bước 4)
                  </Button>
                )}
              </div>
            </div>
          )}

          {execError && (
             <div className="mt-8 p-6 bg-red-50 dark:bg-red-950/50 rounded-2xl border border-red-200 dark:border-red-800 text-left max-w-lg mx-auto">
               <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold mb-2">
                 <AlertTriangle className="w-5 h-5" /> Lỗi Thực Thi Generator
               </div>
               <pre className="text-xs font-mono text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/40 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap max-h-60">
                 {execError}
               </pre>
               <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3">
                 {onUseErrorAsFeedback && (
                   <Button 
                     onClick={() => onUseErrorAsFeedback(execError)} 
                     variant="default"
                     size="sm" 
                     className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                   >
                     <CornerDownLeft className="w-4 h-4 mr-1.5" /> Gửi lỗi này làm Feedback sửa Code
                   </Button>
                 )}
                 <Button onClick={onExecuteCode} variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300">
                   Thử chạy lại
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
