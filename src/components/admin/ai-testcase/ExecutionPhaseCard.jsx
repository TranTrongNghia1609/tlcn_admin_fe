import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Terminal, Play, CheckCircle2, Loader2, Download, AlertTriangle, CornerDownLeft, CircleArrowRight, History, Sparkles, Zap, ShieldCheck, Plus, Edit, Trash2, Layers, Table, FileText, Check, Copy, Eye, X, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

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
  isAppliedTestCase = false,
  testCases = [],
  manualTestCases = [],
  isManualLoading = false,
  isRebuilding = false,
  onAddManualTestCase,
  onUpdateManualTestCase,
  onDeleteManualTestCase,
  onRebuildTestCases
}) => {
  const [activeTab, setActiveTab] = useState('ai-previews');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [modalInput, setModalInput] = useState('');
  const [modalOutput, setModalOutput] = useState('');
  const [selectedPreviewModal, setSelectedPreviewModal] = useState(null);

  const handleOpenAddModal = () => {
    setEditingIndex(null);
    setModalInput('');
    setModalOutput('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingIndex(item.index);
    setModalInput(item.input || item.inputPreview || '');
    setModalOutput(item.output || item.outputPreview || '');
    setIsModalOpen(true);
  };

  const handleSaveManualTestCase = async () => {
    if (!modalInput.trim() || !modalOutput.trim()) {
      toast.warning('Vui lòng nhập đầy đủ Input và Output');
      return;
    }
    if (editingIndex !== null) {
      await onUpdateManualTestCase?.(editingIndex, modalInput, modalOutput);
    } else {
      await onAddManualTestCase?.(modalInput, modalOutput);
    }
    setIsModalOpen(false);
  };

  return (
    <Card className={`overflow-hidden border-0 shadow-2xl transition-all duration-500 ${currentPhase === 3 ? 'ring-2 ring-emerald-500 ring-offset-4 ring-offset-slate-50 dark:ring-offset-slate-950' : 'opacity-70 grayscale-[30%] hover:grayscale-0'}`}>
       <div className="bg-gradient-to-r from-slate-100 to-white dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-5 flex justify-between items-center cursor-pointer"
           onClick={onPhaseClick}>
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100 flex-wrap">
          <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400 p-1.5 rounded-lg font-black">3</span> 
          <span>Thực thi, Previews & Quản lý Testcase</span>
          {selectedVersionNumber && (
            <span className="ml-1 text-xs font-semibold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
              Version Code #{selectedVersionNumber}
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
        <div className="p-8 bg-white dark:bg-slate-900 text-left space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <TabsList className="bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl h-auto flex flex-wrap gap-1">
                <TabsTrigger value="ai-previews" className="px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Testcase Tự Động & Previews</span>
                  {testCases && testCases.length > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-full font-extrabold">
                      {testCases.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="manual-testcases" className="px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Testcase Thủ Công (Manual CRUD)</span>
                  <span className="px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full font-extrabold">
                    {manualTestCases?.length || 0}
                  </span>
                </TabsTrigger>
              </TabsList>

              {activeTab === 'manual-testcases' && (
                <Button onClick={handleOpenAddModal} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Thêm Testcase Thủ Công
                </Button>
              )}
            </div>

            {/* Tab 1: AI / Script Previews & Execution */}
            <TabsContent value="ai-previews" className="space-y-8 focus:outline-none">
              {!testCaseUrl && !isExecLoading && (
                 <div className="max-w-md mx-auto space-y-6 text-center py-6">
                   <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Terminal className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                   </div>
                   <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Thực thi Code Generator</h3>
                   <p className="text-slate-500">Hệ thống sẽ chạy các file Python trong môi trường ảo, tạo ra các tệp `.in` và `.out`, trích xuất preview 100 ký tự và nén thành tệp ZIP cho bạn.</p>
                   <Button onClick={onExecuteCode} className="w-full py-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-xl shadow-emerald-500/30">
                     <Play className="w-6 h-6 mr-2 fill-current" /> Bắt đầu Chạy (Execute Code)
                   </Button>
                 </div>
              )}

              {isExecLoading && (
                <div className="py-16 space-y-6 max-w-md mx-auto text-center">
                   <div className="bg-slate-900 rounded-xl p-6 shadow-2xl relative overflow-hidden font-mono text-left">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-indigo-500 to-purple-500" />
                     <div className="flex gap-2 mb-4">
                       <div className="w-3 h-3 rounded-full bg-red-500" />
                       <div className="w-3 h-3 rounded-full bg-amber-500" />
                       <div className="w-3 h-3 rounded-full bg-emerald-500" />
                     </div>
                     <p className="text-emerald-400 text-sm mb-2">$ python input_generator.py</p>
                     <p className="text-slate-400 text-xs mb-2">Generating testcases in Docker...</p>
                     <p className="text-slate-400 text-xs mb-2">Extracting 100 chars previews...</p>
                     <p className="text-slate-400 text-xs animate-pulse">&gt; Compressing into ZIP on S3...</p>
                   </div>
                   <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 animate-pulse">Đang thực thi mã generator và tạo tệp ZIP...</p>
                </div>
              )}

              {testCaseUrl && !isExecLoading && (
                <div className="py-8 max-w-2xl mx-auto bg-gradient-to-b from-emerald-50/80 to-white dark:from-emerald-950/20 dark:to-slate-900 rounded-3xl border border-emerald-200/80 dark:border-emerald-800/50 shadow-xl overflow-hidden text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/40">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Hoàn tất xuất sắc!</h3>
                  <p className="text-slate-500 px-6 mb-6">Bộ testcase đã được tạo thành công, sẵn sàng xem trước hoặc tải về.</p>
                  
                  {/* Active Testcase Banner Card */}
                  {problemId && isAppliedTestCase && (
                    <div className="mx-8 mb-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 dark:from-emerald-500/20 dark:via-teal-500/20 dark:to-cyan-500/20 border-2 border-emerald-500/40 dark:border-emerald-500/60 shadow-lg shadow-emerald-500/5 relative overflow-hidden group text-left">
                      <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                      
                      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wide bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 animate-pulse">
                          <Sparkles className="w-3.5 h-3.5 fill-current" /> ĐANG ÁP DỤNG CHÍNH THỨC
                        </span>
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-700">
                          Version Code #{selectedVersionNumber || 'Hiện tại'}
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
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={onDownload}
                        disabled={isDownloading}
                        className="flex-1 py-6 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-sm transition-transform hover:scale-105 active:scale-95 shadow-md"
                      >
                        {isDownloading
                          ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang lấy link...</>
                          : <><Download className="w-4 h-4 mr-2" /> Tải về tệp ZIP</>}
                      </Button>

                      {problemId && !isAppliedTestCase && (
                        <Button
                          onClick={onApplyTestCase}
                          disabled={isApplying}
                          className="flex-1 py-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-xl shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 border-0"
                        >
                          {isApplying
                            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang áp dụng...</>
                            : <><Zap className="w-4 h-4 mr-2 fill-current animate-bounce" /> Áp dụng vào Bài tập</>}
                        </Button>
                      )}
                    </div>
                    
                    {onGoToVersions && (
                      <Button
                        onClick={onGoToVersions}
                        variant="outline"
                        className="w-full py-5 rounded-xl border-emerald-300 dark:border-emerald-700 font-bold text-sm transition-transform hover:scale-105 active:scale-95 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                      >
                        <History className="w-4 h-4 mr-2" /> Xem Lịch Sử Phiên Bản (Bước 4)
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {execError && (
                 <div className="mt-6 p-6 bg-red-50 dark:bg-red-950/50 rounded-2xl border border-red-200 dark:border-red-800 text-left max-w-lg mx-auto">
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

              {/* Test Case Previews Section */}
              {testCases && testCases.length > 0 && (
                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Table className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        Danh Sách Testcase Previews ({testCases.length} testcases)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Đoạn xem trước 100 ký tự đầu tiên của các tệp `test.inp` và `test.out` được trả về ngay qua WebSocket/API mà không cần tải ZIP.
                      </p>
                    </div>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-extrabold text-slate-600 dark:text-slate-300">
                            <th className="py-3 px-4 w-20 text-center">STT</th>
                            <th className="py-3 px-4">Input Preview (test.inp)</th>
                            <th className="py-3 px-4">Output Preview (test.out)</th>
                            <th className="py-3 px-4 w-28 text-center">Chi tiết</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                          {testCases.map((tc, idx) => (
                            <tr key={`tc-preview-${tc.index || idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-4 text-center font-black text-emerald-600 dark:text-emerald-400">
                                #{tc.index || idx + 1}
                              </td>
                              <td className="py-3 px-4 font-mono text-xs text-slate-700 dark:text-slate-300 max-w-xs truncate">
                                <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200/60 dark:border-slate-800/60 truncate">
                                  {tc.inputPreview || 'N/A'}
                                </div>
                              </td>
                              <td className="py-3 px-4 font-mono text-xs text-slate-700 dark:text-slate-300 max-w-xs truncate">
                                <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200/60 dark:border-slate-800/60 truncate">
                                  {tc.outputPreview || 'N/A'}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => setSelectedPreviewModal(tc)}
                                  className="h-8 px-3 text-xs rounded-lg border-slate-300 dark:border-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 font-bold shadow-sm"
                                >
                                  <Eye className="w-3.5 h-3.5 mr-1" /> Xem
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tab 2: Manual Test Cases CRUD */}
            <TabsContent value="manual-testcases" className="space-y-8 focus:outline-none">
              <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-base font-extrabold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    Quản lý Testcase Thủ Công (Manual Test Cases)
                  </h4>
                  <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed max-w-2xl">
                    Bạn có thể tự do thêm từng testcase riêng lẻ (ví dụ input kiểm tra biên, trường hợp ngoại lệ đặc thù) vào danh sách này. Sau đó nhấn <strong>Tái Tạo & Gộp Testcase</strong> để nối chúng vào tệp ZIP tổng trên S3.
                  </p>
                </div>
                <Button onClick={handleOpenAddModal} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shrink-0 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Thêm Testcase Mới
                </Button>
              </div>

              {isManualLoading ? (
                <div className="py-12 flex justify-center items-center">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
              ) : (!manualTestCases || manualTestCases.length === 0) ? (
                <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50">
                  <Layers className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                  <h4 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">Chưa có testcase thủ công nào</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
                    Hãy thêm các testcase do bạn tự viết để đảm bảo bài tập kiểm tra đầy đủ mọi tình huống biên mà AI có thể bỏ sót.
                  </p>
                  <Button onClick={handleOpenAddModal} variant="outline" className="border-indigo-300 text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl">
                    <Plus className="w-4 h-4 mr-1.5" /> Thêm Testcase Đầu Tiên
                  </Button>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-extrabold text-slate-600 dark:text-slate-300">
                          <th className="py-3.5 px-4 w-20 text-center">STT</th>
                          <th className="py-3.5 px-4">Input (test.inp)</th>
                          <th className="py-3.5 px-4">Output (test.out)</th>
                          <th className="py-3.5 px-4 w-36">Ngày tạo</th>
                          <th className="py-3.5 px-4 w-32 text-center">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {manualTestCases.map((tc, idx) => (
                          <tr key={`manual-tc-${tc.index || idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4 text-center font-black text-indigo-600 dark:text-indigo-400">
                              #{tc.index || idx + 1}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-xs text-slate-700 dark:text-slate-300 max-w-xs truncate">
                              <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200/60 dark:border-slate-800/60 truncate">
                                {tc.input || tc.inputPreview || 'N/A'}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-xs text-slate-700 dark:text-slate-300 max-w-xs truncate">
                              <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200/60 dark:border-slate-800/60 truncate">
                                {tc.output || tc.outputPreview || 'N/A'}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-xs text-slate-500">
                              {tc.createdAt ? new Date(tc.createdAt).toLocaleString('vi-VN') : 'Vừa tạo'}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleOpenEditModal(tc)}
                                  className="h-8 w-8 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg"
                                  title="Chỉnh sửa testcase"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => onDeleteManualTestCase?.(tc.index)}
                                  className="h-8 w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg"
                                  title="Xóa testcase"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Rebuild & Merge Banner Box */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-fuchsia-500/10 border-2 border-indigo-500/30 dark:border-indigo-500/50 shadow-lg space-y-4">
                <div className="flex items-start justify-between gap-6 flex-wrap">
                  <div className="space-y-1 max-w-2xl">
                    <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                      <RefreshCw className={`w-5 h-5 text-indigo-600 dark:text-indigo-400 ${isRebuilding ? 'animate-spin' : ''}`} />
                      Tái Tạo & Gộp Testcase (Rebuild & Merge into S3 ZIP)
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Hệ thống gộp các test cases từ AI và test cases thủ công
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <Button
                      onClick={onRebuildTestCases}
                      disabled={isRebuilding || (!testCaseUrl && (!testCases || testCases.length === 0)) || (!manualTestCases || manualTestCases.length === 0)}
                      className="flex-1 sm:flex-none px-6 py-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all text-sm"
                    >
                      {isRebuilding ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang gộp và tạo ZIP...</>
                      ) : (
                        <><RefreshCw className="w-5 h-5 mr-2" /> Gộp Testcase Ngay</>
                      )}
                    </Button>

                    {problemId && (
                      <Button
                        onClick={onApplyTestCase}
                        disabled={isApplying || !testCaseUrl}
                        variant="outline"
                        className="flex-1 sm:flex-none px-6 py-6 rounded-xl border-emerald-500 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 font-extrabold text-sm transition-all shadow-sm"
                      >
                        {isApplying ? (
                          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang áp dụng...</>
                        ) : (
                          <><Zap className="w-5 h-5 mr-2 fill-current" /> Áp dụng cho Bài Tập</>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Dialog Add/Edit Manual Testcase */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-xl rounded-2xl p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  {editingIndex !== null ? <Edit className="w-5 h-5 text-indigo-600" /> : <Plus className="w-5 h-5 text-indigo-600" />}
                  {editingIndex !== null ? `Chỉnh sửa Testcase Thủ Công #${editingIndex}` : 'Thêm Testcase Thủ Công Mới'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Input (dữ liệu đầu vào `test.inp`)</span>
                    <span className="text-[10px] font-normal text-slate-400">Không quá 50,000 ký tự</span>
                  </label>
                  <textarea
                    rows={6}
                    value={modalInput}
                    onChange={(e) => setModalInput(e.target.value)}
                    placeholder="Nhập nội dung cho file test.inp (ví dụ: 5\n10 20 30 40 50)..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3.5 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none custom-scrollbar"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Output (dữ liệu đầu ra mong đợi `test.out`)</span>
                    <span className="text-[10px] font-normal text-slate-400">Không quá 50,000 ký tự</span>
                  </label>
                  <textarea
                    rows={6}
                    value={modalOutput}
                    onChange={(e) => setModalOutput(e.target.value)}
                    placeholder="Nhập nội dung cho file test.out (ví dụ: 150)..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3.5 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none custom-scrollbar"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold">
                  Hủy
                </Button>
                <Button onClick={handleSaveManualTestCase} disabled={isManualLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold px-6 shadow-md">
                  {isManualLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Check className="w-4 h-4 mr-1.5" />}
                  {editingIndex !== null ? 'Cập Nhật Testcase' : 'Lưu Testcase Mới'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog View Full Preview Snippet */}
          <Dialog open={Boolean(selectedPreviewModal)} onOpenChange={() => setSelectedPreviewModal(null)}>
            <DialogContent className="max-w-2xl rounded-2xl p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Chi Tiết Testcase Preview #{selectedPreviewModal?.index}
                </DialogTitle>
              </DialogHeader>

              {selectedPreviewModal && (
                <div className="space-y-4 py-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                      <span>Input Preview (100 ký tự đầu tiên của `test.inp`)</span>
                    </label>
                    <pre className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-4 font-mono text-xs overflow-auto whitespace-pre-wrap max-h-48 custom-scrollbar text-slate-800 dark:text-slate-200">
                      {selectedPreviewModal.inputPreview || 'N/A'}
                    </pre>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                      <span>Output Preview (100 ký tự đầu tiên của `test.out`)</span>
                    </label>
                    <pre className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-4 font-mono text-xs overflow-auto whitespace-pre-wrap max-h-48 custom-scrollbar text-slate-800 dark:text-slate-200">
                      {selectedPreviewModal.outputPreview || 'N/A'}
                    </pre>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button onClick={() => setSelectedPreviewModal(null)} className="rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 px-6">
                  Đóng
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </Card>
  );
};

export default ExecutionPhaseCard;
