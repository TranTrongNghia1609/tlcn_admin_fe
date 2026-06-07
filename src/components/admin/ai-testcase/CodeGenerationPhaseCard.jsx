import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Terminal, Bot, RefreshCw, Send, ArrowRight, AlertTriangle, CornerDownLeft } from 'lucide-react';
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
  onContinue
}) => {
  return (
    <Card className={`overflow-hidden border-0 shadow-2xl transition-all duration-500 ${currentPhase === 2 ? 'ring-2 ring-purple-500 ring-offset-4 ring-offset-slate-50 dark:ring-offset-slate-950' : 'opacity-70 grayscale-[30%] hover:grayscale-0'}`}>
      <div className="bg-gradient-to-r from-slate-100 to-white dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-5 flex justify-between items-center cursor-pointer"
           onClick={onPhaseClick}>
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-400 p-1.5 rounded-lg">2</span> 
          Sinh Mã (Code Generation)
        </h2>
      </div>
      
      {currentPhase === 2 && (
        <div className="p-8 bg-white dark:bg-slate-900 space-y-8">
          
          {!inputCode && !isCodeLoading && (
             <div className="text-center p-12 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <Terminal className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Sẵn sàng sinh Code Python</h3>
                <p className="text-slate-500 mb-6">AI sẽ viết script tạo Input và Output tự động dựa trên Kế hoạch ở Bước 1.</p>
                <Button onClick={onGenerateCode} className="px-8 py-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg shadow-purple-500/30">
                  <Bot className="w-5 h-5 mr-2" /> Bắt đầu Sinh Code
                </Button>
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
                  <span>Output Generator (Python)</span>
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
          )}

          {inputCode && !isCodeLoading && (
            <div className="bg-purple-50 dark:bg-purple-900/10 rounded-2xl p-6 border border-purple-100 dark:border-purple-900/30">
              <h3 className="font-bold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2">
                <RefreshCw className="w-5 h-5" /> Phản hồi & Tinh chỉnh Code
              </h3>
              <div className="flex gap-4">
                <textarea 
                  className="flex-1 rounded-xl border-purple-200 dark:border-purple-800/50 bg-white dark:bg-slate-900 p-4 text-sm focus:ring-2 focus:ring-purple-500 resize-none shadow-inner"
                  placeholder="Code có vấn đề? Hãy mô tả lỗi hoặc mong muốn thay đổi để AI sửa lại..."
                  rows={2}
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                />
                <Button onClick={onGenerateCode} disabled={!feedback.trim()} className="px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shrink-0">
                  <Send className="w-4 h-4 mr-2" /> Gửi
                </Button>
              </div>
              
              <div className="mt-6 flex justify-end border-t border-purple-200/50 dark:border-purple-800/30 pt-6">
                <Button onClick={onContinue} className="px-8 py-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/30 text-base">
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
