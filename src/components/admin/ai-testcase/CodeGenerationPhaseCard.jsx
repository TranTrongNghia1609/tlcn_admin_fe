import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Terminal, Bot, RefreshCw, Send, ArrowRight, AlertTriangle, CornerDownLeft, History, Code, FileCode, Sparkles, Check, Info, Wand2 } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { githubLight } from '@uiw/codemirror-theme-github';

const CodeGenerationPhaseCard = ({
  currentPhase,
  planCategories,
  inputCode,
  outputCode,
  isCodeLoading,
  isDark,
  feedback,
  setFeedback,
  codeError,
  onGenerateCode,
  onUseErrorAsFeedback,
  onPhaseClick,
  onContinue,
  selectedVersionNumber,
  onGoToVersions,
  mode = 'ai',
  setMode,
  solutionCode = '',
  setSolutionCode,
  codeVersionMode = 'ai'
}) => {
  return (
    <Card className={`overflow-hidden border-0 shadow-2xl transition-all duration-500 ${currentPhase === 2 ? 'ring-2 ring-purple-500 ring-offset-4 ring-offset-slate-50 dark:ring-offset-slate-950' : 'opacity-70 grayscale-[30%] hover:grayscale-0'}`}>
      <div className="bg-gradient-to-r from-slate-100 to-white dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-5 flex justify-between items-center cursor-pointer"
           onClick={onPhaseClick}>
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-400 p-1.5 rounded-lg">2</span> 
          Sinh Mã (Code Generation)
          {selectedVersionNumber && (
            <span className="ml-2 text-xs font-semibold px-2.5 py-1 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-800">
              Đang xem Version #{selectedVersionNumber}
            </span>
          )}
        </h2>
      </div>
      
      {currentPhase === 2 && (
        <div className="p-8 bg-white dark:bg-slate-900 space-y-8">
          
          {!inputCode && !isCodeLoading && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
              {/* Mode Selection Header */}
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />
                  Chọn phương thức Sinh Code Generator
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Bạn muốn AI tự động viết toàn bộ lời giải mẫu, hay muốn sử dụng lời giải Python chuẩn của chính bạn?
                </p>
              </div>

              {/* Mode Selector Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Option 1: AI Mode */}
                <div 
                  onClick={() => setMode?.('ai')}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                    mode === 'ai'
                      ? 'border-purple-600 dark:border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 shadow-xl shadow-purple-500/10 scale-[1.02]'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 hover:border-purple-300 dark:hover:border-purple-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {mode === 'ai' && (
                    <div className="absolute top-4 right-4 bg-purple-600 text-white p-1 rounded-full shadow-md">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                  <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 group-hover:scale-110 transition-transform shadow-sm">
                    <Bot className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
                    AI Tự động hoàn toàn
                    <span className="text-[11px] font-semibold px-2 py-0.5 bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 rounded-full">
                      Mặc định
                    </span>
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    AI sẽ phân tích Kế hoạch ở Bước 1 và tự động viết cả 2 file: <strong>Input Generator</strong> (sinh dữ liệu) và <strong>Output Generator</strong> (lời giải mẫu).
                  </p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
                    <Wand2 className="w-4 h-4" /> Nhanh chóng & Tiện lợi tối đa
                  </div>
                </div>

                {/* Option 2: User Solution Mode */}
                <div 
                  onClick={() => setMode?.('user-solution')}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                    mode === 'user-solution'
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xl shadow-indigo-500/10 scale-[1.02]'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 hover:border-indigo-300 dark:hover:border-indigo-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {mode === 'user-solution' && (
                    <div className="absolute top-4 right-4 bg-indigo-600 text-white p-1 rounded-full shadow-md">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform shadow-sm">
                    <Code className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
                    Sử dụng Lời giải của tôi
                    <span className="text-[11px] font-semibold px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-full">
                      Mới / Chính xác cao
                    </span>
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    Bạn cung cấp code giải thuật Python chuẩn. AI sẽ chỉ tập trung viết script sinh Input và dùng chính code của bạn làm <strong>Output Generator</strong>.
                  </p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <Check className="w-4 h-4" /> Đảm bảo Output đúng 100% theo ý bạn
                  </div>
                </div>
              </div>

              {/* Solution Code Editor (When Mode is User-Solution) */}
              {mode === 'user-solution' && (
                <div className="space-y-3 p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-indigo-200/80 dark:border-indigo-900/50 shadow-inner animate-in fade-in duration-300">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                      <FileCode className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <span>Nhập mã nguồn Lời giải (Python Solution Code) <span className="text-red-500">*</span></span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSolutionCode?.(`import sys\n\ndef solve():\n    # Đọc input từ chuẩn sys.stdin và in ra chuẩn sys.stdout\n    # Ví dụ: n = int(sys.stdin.readline())\n    pass\n\nif __name__ == '__main__':\n    solve()\n`)}
                      className="text-xs h-8 px-3 font-semibold text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                    >
                      <Wand2 className="w-3.5 h-3.5 mr-1.5" /> Chèn mẫu code chuẩn
                    </Button>
                  </div>

                  <div className="border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                    <CodeMirror
                      value={solutionCode}
                      height="250px"
                      extensions={[python()]}
                      theme={isDark ? vscodeDark : githubLight}
                      onChange={(val) => setSolutionCode?.(val)}
                      placeholder="# Nhập code giải thuật Python của bạn tại đây..."
                      className="text-sm"
                    />
                  </div>

                  <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 bg-indigo-50/50 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                    <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <strong>Lưu ý quan trọng:</strong> Lời giải của bạn nên đọc dữ liệu đầu vào từ chuẩn <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">stdin</code> (ví dụ: <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">sys.stdin.read()</code> hoặc <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">input()</code>) và in kết quả ra <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">stdout</code>.
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="text-center pt-2">
                <Button 
                  onClick={onGenerateCode} 
                  disabled={mode === 'user-solution' && !solutionCode?.trim()}
                  className="px-10 py-7 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-lg shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Bot className="w-6 h-6 mr-2.5" /> Bắt đầu Sinh Code ({mode === 'ai' ? 'AI Mode' : 'User Solution'})
                </Button>
              </div>
            </div>
          )}

          {isCodeLoading && (
            <div className="h-64 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-purple-600 dark:text-purple-400 font-bold animate-pulse text-lg">AI đang viết code cho bạn...</p>
            </div>
          )}

          {/* Error Display */}
          {codeError && !isCodeLoading && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/40 rounded-2xl p-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-red-800 dark:text-red-300 mb-2">Sinh mã thất bại</h4>
                  <pre className="text-sm text-red-700 dark:text-red-400 bg-red-100/50 dark:bg-red-900/20 rounded-xl p-4 whitespace-pre-wrap break-words font-mono border border-red-200/50 dark:border-red-800/30 max-h-48 overflow-auto custom-scrollbar">
                    {codeError}
                  </pre>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={() => onUseErrorAsFeedback(codeError)}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02]"
                >
                  <CornerDownLeft className="w-4 h-4 mr-2" /> Dùng làm Feedback để Sinh Lại
                </Button>
              </div>
            </div>
          )}

          {inputCode && !isCodeLoading && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Mode Banner */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 flex-wrap shadow-sm ${
                codeVersionMode === 'user-solution'
                  ? 'bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/30 border-indigo-200 dark:border-indigo-800/60 text-indigo-950 dark:text-indigo-100'
                  : 'bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-950/40 dark:to-fuchsia-950/30 border-purple-200 dark:border-purple-800/60 text-purple-950 dark:text-purple-100'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    codeVersionMode === 'user-solution' ? 'bg-indigo-600 text-white' : 'bg-purple-600 text-white'
                  }`}>
                    {codeVersionMode === 'user-solution' ? <Code className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm flex items-center gap-2">
                      {codeVersionMode === 'user-solution' ? 'Chế độ Lời giải của bạn (User Solution Mode)' : 'Chế độ AI Tự động hoàn toàn (AI Mode)'}
                    </div>
                    <div className="text-xs opacity-80 mt-0.5">
                      {codeVersionMode === 'user-solution' 
                        ? 'Output Generator chính là mã nguồn lời giải do bạn cung cấp. AI đã tạo Input Generator tương ứng.'
                        : 'Cả Input Generator và Output Generator đều được AI viết tự động dựa trên Kế hoạch Bước 1.'}
                    </div>
                  </div>
                </div>
                
                <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                  codeVersionMode === 'user-solution'
                    ? 'bg-white dark:bg-indigo-900/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-200'
                    : 'bg-white dark:bg-purple-900/60 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-200'
                }`}>
                  Version #{selectedVersionNumber || 1}
                </span>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Input Code */}
                <div className="space-y-2 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 font-bold text-sm text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Input Generator (Python)</span>
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500">Read-only</span>
                  </div>
                  <div className="h-[400px] overflow-auto custom-scrollbar">
                    <CodeMirror
                      value={inputCode}
                      height="400px"
                      extensions={[python()]}
                      theme={isDark ? vscodeDark : githubLight}
                      editable={false}
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Output Code */}
                <div className="space-y-2 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 font-bold text-sm text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Output Generator (Python) - {codeVersionMode === 'user-solution' ? 'Lời giải của bạn' : 'Lời giải mẫu'}</span>
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500">Read-only</span>
                  </div>
                  <div className="h-[400px] overflow-auto custom-scrollbar">
                    <CodeMirror
                      value={outputCode}
                      height="400px"
                      extensions={[python()]}
                      theme={isDark ? vscodeDark : githubLight}
                      editable={false}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {inputCode && !isCodeLoading && (
            <div className="bg-purple-50/70 dark:bg-purple-950/20 rounded-3xl p-6 border border-purple-200/80 dark:border-purple-800/40 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-purple-200/60 dark:border-purple-800/40">
                <div>
                  <h3 className="font-bold text-purple-900 dark:text-purple-200 text-base flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-purple-600 dark:text-purple-400" /> 
                    Phản hồi & Tinh chỉnh Code (Sinh lại Version mới)
                  </h3>
                  <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">
                    Bạn có thể chọn lại chế độ sinh mã hoặc chỉnh sửa lời giải, kèm theo phản hồi chi tiết để AI tinh chỉnh code.
                  </p>
                </div>

                {/* Mode Switcher for Regeneration */}
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setMode?.('ai')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      mode === 'ai'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" /> AI Tự động
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode?.('user-solution')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      mode === 'user-solution'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" /> Lời giải của tôi
                  </button>
                </div>
              </div>

              {/* Solution Code Editor in Refinement when Mode is User-Solution */}
              {mode === 'user-solution' && (
                <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 shadow-sm animate-in fade-in duration-300">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    <span className="flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      Chỉnh sửa Lời giải Python (Output Generator) cho Version tiếp theo:
                    </span>
                    <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded text-indigo-700 dark:text-indigo-300">
                      Có thể sửa code lời giải
                    </span>
                  </div>
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <CodeMirror
                      value={solutionCode}
                      height="200px"
                      extensions={[python()]}
                      theme={isDark ? vscodeDark : githubLight}
                      onChange={(val) => setSolutionCode?.(val)}
                      placeholder="# Nhập code giải thuật Python của bạn tại đây..."
                      className="text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Feedback Input */}
              <div className="flex flex-col sm:flex-row gap-4">
                <textarea 
                  className="flex-1 rounded-xl border-purple-200 dark:border-purple-800/60 bg-white dark:bg-slate-900 p-4 text-sm focus:ring-2 focus:ring-purple-500 resize-none shadow-inner custom-scrollbar"
                  placeholder={mode === 'user-solution'
                    ? "Nhập phản hồi thêm cho AI (ví dụ: 'Hãy chỉnh lại script sinh Input để tạo mảng toàn số âm', v.v.) - Có thể để trống nếu chỉ cập nhật Lời giải..."
                    : "Code có vấn đề? Hãy mô tả lỗi hoặc mong muốn thay đổi để AI sửa lại..."}
                  rows={2}
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                />
                <Button 
                  onClick={onGenerateCode} 
                  disabled={mode === 'ai' ? !feedback?.trim() : !solutionCode?.trim()} 
                  className={`px-8 py-6 rounded-xl text-white font-bold shrink-0 shadow-lg flex items-center justify-center transition-all ${
                    mode === 'user-solution'
                      ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25'
                      : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/25'
                  }`}
                >
                  <Send className="w-4 h-4 mr-2" /> 
                  {mode === 'user-solution' ? 'Sinh lại với Lời giải này' : 'Gửi Feedback & Sinh lại'}
                </Button>
              </div>
              
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-purple-200/50 dark:border-purple-800/30 pt-6">
                {onGoToVersions && (
                  <Button onClick={onGoToVersions} variant="outline" className="px-6 py-6 rounded-xl border-purple-300 dark:border-purple-700 font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950">
                    <History className="w-4 h-4 mr-2" /> Xem Lịch Sử Phiên Bản (Bước 4)
                  </Button>
                )}
                <Button onClick={onContinue} className="px-8 py-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/30 text-base ml-auto">
                  Chốt Code & Tiếp Tục <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default CodeGenerationPhaseCard;
