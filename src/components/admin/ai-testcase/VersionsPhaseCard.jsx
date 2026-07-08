import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Bot, Cpu, Clock, CheckCircle2, AlertTriangle, MessageSquare, Eye, Code, Play, Layers, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

const VersionsPhaseCard = ({
  currentPhase,
  planVersions = [],
  codeVersions = [],
  selectedVersionNumber,
  onSelectVersion,
  onPhaseClick,
  isDark
}) => {
  const [collapsedPlans, setCollapsedPlans] = useState({});

  const togglePlanCollapse = (planVerNum, e) => {
    if (e) e.stopPropagation();
    setCollapsedPlans(prev => ({
      ...prev,
      [planVerNum]: !prev[planVerNum]
    }));
  };

  // 1. Thu thập tất cả các số Plan Version từ planVersions và codeVersions
  const planVerNums = new Set();
  (planVersions || []).forEach(p => (p.versionNumber || p.planVersionNumber) && planVerNums.add(p.versionNumber || p.planVersionNumber));
  (codeVersions || []).forEach(c => (c.planVersionNumber || 1) && planVerNums.add(c.planVersionNumber || 1));
  
  if (planVerNums.size === 0 && ((codeVersions && codeVersions.length > 0) || (planVersions && planVersions.length > 0))) {
    planVerNums.add(1);
  }

  const sortedPlanVerNums = Array.from(planVerNums).sort((a, b) => b - a);
  const latestPlanVerNum = sortedPlanVerNums.length > 0 ? Math.max(...sortedPlanVerNums) : null;
  const latestCodeVersionNumber = codeVersions?.length > 0 ? Math.max(...codeVersions.map(v => v.versionNumber || 0)) : null;

  return (
    <Card className={`overflow-hidden border-0 shadow-2xl transition-all duration-500 ${currentPhase === 4 ? 'ring-2 ring-amber-500 ring-offset-4 ring-offset-slate-50 dark:ring-offset-slate-950' : 'opacity-70 grayscale-[30%] hover:grayscale-0'}`}>
      <div className="bg-gradient-to-r from-slate-100 to-white dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-5 flex justify-between items-center cursor-pointer"
           onClick={onPhaseClick}>
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 p-1.5 rounded-lg font-black">4</span> 
          Lịch sử Phiên bản ({sortedPlanVerNums.length} Plan • {codeVersions?.length || 0} Code)
        </h2>
        {selectedVersionNumber && (
          <span className="text-xs font-semibold px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded-full border border-amber-300 dark:border-amber-700">
            Đang hiển thị Code: Version #{selectedVersionNumber}
          </span>
        )}
      </div>
      
      {currentPhase === 4 && (
        <div className="p-8 bg-white dark:bg-slate-900 space-y-8">
          {sortedPlanVerNums.length === 0 ? (
            <div className="text-center p-12 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
              <History className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Chưa có phiên bản nào</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                Hãy hoàn thành Bước 1 (Lập kế hoạch) và Bước 2 (Sinh mã Generator) để hệ thống tạo và lưu trữ các phiên bản tại đây.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200/50 dark:border-amber-800/30">
                <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300 font-medium">
                  <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Dưới đây được chia theo <strong>Phiên bản Kế hoạch (Plan Version)</strong>. Nhấn vào thanh tiêu đề hoặc nút thu gọn/mở rộng để đóng mở danh sách code test case.</span>
                </div>
              </div>

              {/* Danh sách các Plan Version */}
              <div className="space-y-8">
                {sortedPlanVerNums.map((planVerNum) => {
                  const planObj = (planVersions || []).find(p => (p.versionNumber === planVerNum || p.planVersionNumber === planVerNum)) || { versionNumber: planVerNum };
                  const matchingCodeVersions = (codeVersions || []).filter(c => (c.planVersionNumber || 1) === planVerNum).sort((a, b) => (b.versionNumber || 0) - (a.versionNumber || 0));
                  const isLatestPlan = planVerNum === latestPlanVerNum;
                  const hasCode = matchingCodeVersions.length > 0;
                  const isCollapsed = Boolean(collapsedPlans[planVerNum]);

                  return (
                    <div 
                      key={`plan-ver-${planVerNum}`}
                      className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                        isLatestPlan 
                          ? 'border-indigo-300 dark:border-indigo-700 shadow-lg bg-gradient-to-b from-indigo-50/30 to-white dark:from-indigo-950/20 dark:to-slate-900' 
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50'
                      }`}
                    >
                      {/* Plan Version Header */}
                      <div 
                        onClick={(e) => togglePlanCollapse(planVerNum, e)}
                        className="bg-slate-100/80 dark:bg-slate-800/80 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-700/80 cursor-pointer select-none hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-2 bg-indigo-600 text-white px-3.5 py-1.5 rounded-xl font-black text-sm shadow-md shadow-indigo-500/20">
                            <Layers className="w-4 h-4" /> Plan Version #{planVerNum}
                          </div>
                          {isLatestPlan && (
                            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700">
                              Plan Mới Nhất
                            </span>
                          )}
                          {planObj.model && (
                            <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                              <Bot className="w-3.5 h-3.5 text-indigo-500" /> {planObj.model}
                            </span>
                          )}
                          {planObj.generatedAt && (
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 ml-1">
                              <Clock className="w-3.5 h-3.5" /> {new Date(planObj.generatedAt).toLocaleString('vi-VN')}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5">
                          {!hasCode ? (
                            <Button
                              onClick={(e) => { e.stopPropagation(); onSelectVersion(null, 2, planObj); }}
                              size="sm"
                              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md animate-pulse"
                            >
                              <Code className="w-3.5 h-3.5 mr-1.5" /> Nhảy sang Bước 2 Tạo Code
                            </Button>
                          ) : (
                            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              Có {matchingCodeVersions.length} phiên bản Code
                            </span>
                          )}

                          <Button
                            onClick={(e) => togglePlanCollapse(planVerNum, e)}
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs font-bold rounded-xl border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-sm"
                          >
                            {isCollapsed ? (
                              <>
                                <span>Mở rộng</span> <ChevronDown className="w-4 h-4 text-indigo-500" />
                              </>
                            ) : (
                              <>
                                <span>Thu gọn</span> <ChevronUp className="w-4 h-4 text-indigo-500" />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Plan Version Body: Code Versions or Empty State */}
                      {!isCollapsed && (
                        <div className="p-6 animate-in fade-in-50 duration-200">
                          {!hasCode ? (
                            <div 
                              onClick={() => onSelectVersion(null, 2, planObj)}
                              className="p-8 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border-2 border-dashed border-amber-300 dark:border-amber-800/60 text-center cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-950/30 transition-all duration-300 group"
                            >
                              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform shadow-sm">
                                <Code className="w-6 h-6" />
                              </div>
                              <h4 className="text-base font-bold text-amber-900 dark:text-amber-200 mb-1">
                                Plan Version #{planVerNum} chưa có Test-case Code
                              </h4>
                              <p className="text-xs text-amber-700 dark:text-amber-400 max-w-md mx-auto mb-5 font-medium">
                                Phiên bản kế hoạch này đã được tạo ra nhưng chưa thực hiện sinh mã code. Nhấn vào đây để nhảy ngay sang Bước 2 và bắt đầu tạo Test-case Code!
                              </p>
                              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-lg shadow-amber-600/20">
                                Chuyển sang Bước 2 Tạo Code Ngay <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                              </Button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-4">
                              {matchingCodeVersions.map((ver) => {
                                const isSelected = ver.versionNumber === selectedVersionNumber;
                                const isLatestCode = ver.versionNumber === latestCodeVersionNumber;
                                const hasZip = Boolean(ver.s3Key);
                                const isError = ver.isSuccessful === false && Boolean(ver.errorMessage);

                                return (
                                  <div 
                                    key={ver._id || ver.versionNumber}
                                    onClick={() => onSelectVersion(ver)}
                                    className={`p-5 rounded-2xl border transition-all duration-300 bg-white dark:bg-slate-900 cursor-pointer hover:shadow-lg ${
                                      isSelected 
                                        ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20 dark:bg-amber-950/20' 
                                        : 'border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700'
                                    }`}
                                  >
                                    {/* Top Row */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-amber-500 text-white shadow-sm">
                                          Code Version #{ver.versionNumber}
                                        </span>
                                        {isLatestCode && (
                                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                                            Code Mới nhất
                                          </span>
                                        )}
                                        {isSelected && (
                                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
                                            Đang hiển thị ở 3 bước trước
                                          </span>
                                        )}
                                      </div>
                                      
                                      <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-medium">
                                        <Clock className="w-3 h-3" /> 
                                        {ver.generatedAt ? new Date(ver.generatedAt).toLocaleString('vi-VN') : 'N/A'}
                                      </div>
                                    </div>

                                    {/* Middle Row: Badges */}
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                                        <Bot className="w-3 h-3 text-indigo-500" /> 
                                        Model: <strong className="text-slate-900 dark:text-white">{ver.model || 'Unknown'}</strong>
                                      </div>
                                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                                        <Cpu className="w-3 h-3 text-purple-500" /> 
                                        Source: <strong className="text-slate-900 dark:text-white">{ver.source || 'AI'}</strong>
                                      </div>
                                      
                                      {ver.mode === 'user-solution' ? (
                                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200/60 dark:border-indigo-800/50">
                                          <Code className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> 
                                          Mode: <strong className="text-indigo-900 dark:text-indigo-200">User Solution</strong>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[11px] font-medium border border-purple-200/60 dark:border-purple-800/50">
                                          <Bot className="w-3 h-3 text-purple-600 dark:text-purple-400" /> 
                                          Mode: <strong className="text-purple-900 dark:text-purple-200">AI Tự động</strong>
                                        </div>
                                      )}

                                      {hasZip ? (
                                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200/60 dark:border-emerald-800/50">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> 
                                          Thành công (Đã có tệp ZIP)
                                        </div>
                                      ) : isError ? (
                                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-[11px] font-bold border border-red-200/60 dark:border-red-800/50">
                                          <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" /> 
                                          Lỗi sinh mã / thực thi
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[11px] font-medium border border-blue-200/60 dark:border-blue-800/50">
                                          Đã sinh code
                                        </div>
                                      )}
                                    </div>

                                    {/* Snippets / Feedback / Errors */}
                                    <div className="space-y-2 mb-4">
                                      {ver.feedback && (
                                        <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/40 text-xs text-purple-800 dark:text-purple-300 flex items-start gap-2">
                                          <MessageSquare className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                                          <div>
                                            <span className="font-bold">Feedback đã gửi: </span>"{ver.feedback}"
                                          </div>
                                        </div>
                                      )}

                                      {ver.errorMessage && (
                                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/40 text-xs text-red-800 dark:text-red-300 flex items-start gap-2">
                                          <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                          <div className="overflow-hidden">
                                            <span className="font-bold">Thông báo lỗi: </span>
                                            <span className="font-mono">{ver.errorMessage}</span>
                                          </div>
                                        </div>
                                      )}

                                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                                        <span>Input Code: <strong className="text-slate-700 dark:text-slate-300">{ver.inputCode ? `${ver.inputCode.length} ký tự` : 'Trống'}</strong></span>
                                        <span>•</span>
                                        <span>Output Code: <strong className="text-slate-700 dark:text-slate-300">{ver.outputCode ? `${ver.outputCode.length} ký tự` : 'Trống'}</strong></span>
                                      </div>
                                    </div>

                                    {/* Bottom Action Buttons */}
                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                                         onClick={(e) => e.stopPropagation()}>
                                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                        Xem chi tiết phiên bản này tại:
                                      </span>
                                      <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                                        <Button 
                                          onClick={() => onSelectVersion(ver, 1)} 
                                          variant="outline" 
                                          size="sm"
                                          className="flex-1 sm:flex-none text-xs font-bold h-8 px-2.5 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-indigo-800/60 dark:hover:bg-indigo-950/50 dark:text-indigo-300"
                                        >
                                          <Eye className="w-3 h-3 mr-1 text-indigo-500" /> Bước 1: Kế hoạch
                                        </Button>
                                        <Button 
                                          onClick={() => onSelectVersion(ver, 2)} 
                                          size="sm"
                                          className="flex-1 sm:flex-none text-xs font-bold h-8 px-2.5 bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                                        >
                                          <Code className="w-3 h-3 mr-1" /> Bước 2: Code Generator
                                        </Button>
                                        <Button 
                                          onClick={() => onSelectVersion(ver, 3)} 
                                          variant="outline" 
                                          size="sm"
                                          className="flex-1 sm:flex-none text-xs font-bold h-8 px-2.5 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-800/60 dark:hover:bg-emerald-950/50 dark:text-emerald-300"
                                        >
                                          <Play className="w-3 h-3 mr-1 text-emerald-500" /> Bước 3: Thực thi & ZIP
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default VersionsPhaseCard;
