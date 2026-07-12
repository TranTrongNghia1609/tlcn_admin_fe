import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Bot, CheckCircle2, ArrowRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import remarkMath from 'remark-math';

const PlanningPhaseCard = ({
  currentPhase,
  statement,
  setStatement,
  inputConstraint,
  setInputConstraint,
  outputConstraint,
  setOutputConstraint,
  numberOfTestCases,
  setNumberOfTestCases,
  inputExample,
  setInputExample,
  outputExample,
  setOutputExample,
  planCategories,
  isPlanLoading,
  onGeneratePlan,
  onPhaseClick,
  onContinue,
  selectedVersionNumber
}) => {
  return (
    <Card className={`overflow-hidden border-0 shadow-2xl transition-all duration-500 ${currentPhase === 1 ? 'ring-2 ring-indigo-500 ring-offset-4 ring-offset-slate-50 dark:ring-offset-slate-950' : 'opacity-70 grayscale-[30%] hover:grayscale-0'}`}>
      <div className="bg-gradient-to-r from-slate-100 to-white dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-5 flex justify-between items-center cursor-pointer"
           onClick={onPhaseClick}>
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-400 p-1.5 rounded-lg">1</span> 
          Thông tin bài toán & Kế hoạch
          {selectedVersionNumber && (
            <span className="ml-2 text-xs font-semibold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-800">
              Version Plan #{selectedVersionNumber}
            </span>
          )}
        </h2>
      </div>
      
      {currentPhase === 1 && (
        <div className="p-8 bg-white dark:bg-slate-900">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Đề bài / Statement <span className="text-red-500">*</span></label>
                <Tabs defaultValue="edit" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-2">
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="edit">
                    <textarea 
                      className="w-full h-32 rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none shadow-inner"
                      placeholder="Nhập nội dung đề bài thuật toán vào đây..."
                      value={statement}
                      onChange={e => setStatement(e.target.value)}
                    />
                  </TabsContent>
                  <TabsContent value="preview">
                    <div className="w-full h-32 overflow-y-auto rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 prose dark:prose-invert max-w-none text-sm text-left">
                      <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeRaw, rehypeKatex]}
                      >
                        {statement?.replace(/\\n/g, '\n')}
                      </ReactMarkdown>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Input Constraints</label>
                  <Tabs defaultValue="edit" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-2">
                      <TabsTrigger value="edit">Edit</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>
                    <TabsContent value="edit">
                      <textarea 
                        className="w-full h-24 rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm p-3 focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                        placeholder="VD: 1 <= N <= 10^5"
                        value={inputConstraint}
                        onChange={e => setInputConstraint(e.target.value)}
                      />
                    </TabsContent>
                    <TabsContent value="preview">
                      <div className="w-full h-24 overflow-y-auto rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 prose dark:prose-invert max-w-none text-sm text-left">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeRaw, rehypeKatex]}
                        >
                          {inputConstraint?.replace(/\\n/g, '\n')}
                        </ReactMarkdown>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Output Constraints</label>
                  <Tabs defaultValue="edit" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-2">
                      <TabsTrigger value="edit">Edit</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>
                    <TabsContent value="edit">
                      <textarea 
                        className="w-full h-24 rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm p-3 focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                        placeholder="Định dạng kết quả đầu ra"
                        value={outputConstraint}
                        onChange={e => setOutputConstraint(e.target.value)}
                      />
                    </TabsContent>
                    <TabsContent value="preview">
                      <div className="w-full h-24 overflow-y-auto rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 prose dark:prose-invert max-w-none text-sm text-left">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeRaw, rehypeKatex]}
                        >
                          {outputConstraint?.replace(/\\n/g, '\n')}
                        </ReactMarkdown>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Ví dụ Input <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className={`w-full h-24 rounded-xl border bg-slate-50 dark:bg-slate-950 text-sm p-3 focus:ring-2 focus:ring-indigo-500 transition-all resize-none ${
                      inputExample.length > 200
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                    placeholder="VD: 5\n1 2 3 4 5"
                    maxLength={200}
                    value={inputExample}
                    onChange={e => setInputExample(e.target.value)}
                  />
                  <p className={`text-xs mt-1 text-right ${
                    inputExample.length > 180 ? 'text-red-500 font-semibold' : 'text-slate-400'
                  }`}>
                    {inputExample.length}/200
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Ví dụ Output <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className={`w-full h-24 rounded-xl border bg-slate-50 dark:bg-slate-950 text-sm p-3 focus:ring-2 focus:ring-indigo-500 transition-all resize-none ${
                      outputExample.length > 200
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                    placeholder="VD: 15"
                    maxLength={200}
                    value={outputExample}
                    onChange={e => setOutputExample(e.target.value)}
                  />
                  <p className={`text-xs mt-1 text-right ${
                    outputExample.length > 180 ? 'text-red-500 font-semibold' : 'text-slate-400'
                  }`}>
                    {outputExample.length}/200
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Số lượng Testcases mong muốn</label>
                <input 
                  type="number" 
                  className="w-full rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm p-3 focus:ring-2 focus:ring-indigo-500 transition-all max-w-[200px]"
                  value={numberOfTestCases}
                  min={1} max={50}
                  onChange={e => setNumberOfTestCases(parseInt(e.target.value))}
                />
              </div>
              <Button 
                onClick={onGeneratePlan} 
                disabled={isPlanLoading || !statement.trim() || !inputExample.trim() || !outputExample.trim() || inputExample.length > 200 || outputExample.length > 200}
                className="w-full lg:w-auto px-8 py-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-base shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02]"
              >
                {isPlanLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Bot className="w-5 h-5 mr-2" />}
                {planCategories.length > 0 ? 'Sinh Lại Kế Hoạch' : 'Phân Tích & Sinh Kế Hoạch'}
              </Button>
            </div>
            
            {/* Plan Results Display */}
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-inner">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500 w-5 h-5" /> Kết quả Kế Hoạch
              </h3>
              
              {isPlanLoading ? (
                <div className="h-48 flex flex-col items-center justify-center text-slate-500">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-30 rounded-full animate-pulse" />
                    <Bot className="w-12 h-12 mb-4 text-indigo-500 relative animate-bounce" />
                  </div>
                  <p className="font-medium animate-pulse">AI đang suy nghĩ và phân tích...</p>
                </div>
              ) : planCategories.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Dưới đây là cấu trúc testcases mà AI đề xuất:</p>
                  <div className="space-y-3">
                    {planCategories.map((cat, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-xl border-l-4 border-indigo-500 shadow-sm flex items-start gap-4">
                        <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 font-black text-xl w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                          {cat.count}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200 capitalize text-sm">{cat.category}</div>
                          <div className="text-sm text-slate-500 mt-1">{cat.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button onClick={onContinue} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6">
                    Đồng ý & Tiếp Tục Sinh Code <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-sm">
                  Nhập đề bài và click sinh kế hoạch để xem kết quả tại đây.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PlanningPhaseCard;
