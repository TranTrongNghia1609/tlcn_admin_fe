import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import TurndownService from 'turndown';
import 'highlight.js/styles/atom-one-dark.css';
import 'katex/dist/katex.min.css';
import { marked } from 'marked';
import PostEditor from '../home/CreatePostComponent/PostEditor';
import CodeBlockEditor from './CodeBlockEditor';
import TagsInput from '../home/CreatePostComponent/TagsInput';

import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import solutionService from '../../services/solutionService';
import { uploadPostImageSingle } from '../../services/postService';
import { toast } from 'sonner';
import { Eye, Code, Plus, Trash2, Code2 } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { githubLight } from '@uiw/codemirror-theme-github';

const APPROACHES = [
  'brute-force',
  'greedy',
  'dynamic-programming',
  'divide-conquer',
  'backtracking',
  'graph',
  'tree',
  'sorting',
  'searching',
  'math',
  'string',
  'array',
  'other'
];

const LANGUAGE_EXTENSIONS = {
  cpp: { extension: cpp, label: 'C++' },
  javascript: { extension: javascript, label: 'JavaScript' },
  python: { extension: python, label: 'Python' },
};

const SolutionForm = ({ 
  solutionId = null, 
  problemShortId = null,
  problemName = '',
  onSuccess, 
  onCancel,
  onFormChange,
  initialData = null
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(
    initialData || {
      title: '',
      content: '',
      approach: 'brute-force',
      complexity: {
        time: 'O(n)',
        space: 'O(1)'
      },
      tags: [],
      codeBlocks: [],
      classroomId: null,
      contestId: null
    }
  );
  const [activeTab, setActiveTab] = useState('edit');
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  
  const [htmlContent, setHtmlContent] = useState('');
  const [codeBlocks, setCodeBlocks] = useState([]);
  const [markdownForPreview, setMarkdownForPreview] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    fence: '```',
    emDelimiter: '_',
    strongDelimiter: '**',
    linkStyle: 'inlined'
  });

  turndownService.addRule('strikethrough', {
    filter: ['del', 's', 'strike'],
    replacement: (content) => '~~' + content + '~~'
  });

  turndownService.addRule('underline', {
    filter: 'u',
    replacement: (content) => '<u>' + content + '</u>'
  });

  useEffect(() => {
    if (solutionId) {
      loadSolution();
    } else if (initialData) {
      setFormData(initialData);
      setMarkdownForPreview(initialData.content || '');
    }
  }, [solutionId]);

  useEffect(() => {
    if (onFormChange && !solutionId) {
      const timer = setTimeout(() => {
        onFormChange(formData);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData, onFormChange, solutionId]);

   const loadSolution = async () => {
    try {
      setLoading(true);
      setIsDataLoaded(false);
      
      const response = await solutionService.getSolutionById(solutionId);
      const solution = response.data;
      
      // Extract code blocks from markdown content
      let textContent = solution.content || '';
      const codeBlockRegex = /```(\w+)\n([\s\S]*?)```/g;
      const extractedBlocks = [];
      let match;
      
      // Extract all code blocks and store them
      while ((match = codeBlockRegex.exec(solution.content)) !== null) {
        const language = match[1].toLowerCase();
        const code = match[2];
        
        // Map language names to supported extensions
        let mappedLang = language;
        if (language === 'c++' || language === 'cpp') mappedLang = 'cpp';
        else if (language === 'js' || language === 'javascript') mappedLang = 'javascript';
        else if (language === 'py' || language === 'python' || language === 'python3') mappedLang = 'python';
        
        // Only add if language is supported
        if (LANGUAGE_EXTENSIONS[mappedLang]) {
          extractedBlocks.push({
            id: Date.now() + extractedBlocks.length,
            code: code,
            language: mappedLang
          });
        }
      }
      
      // Remove code blocks from text content for editor
      textContent = textContent.replace(codeBlockRegex, '').trim();
      
      marked.setOptions({
        breaks: true,
        gfm: true,
      });
      
      const htmlForEditor = marked.parse(textContent);
      
      setFormData({
        title: solution.title,
        content: solution.content,
        approach: solution.approach,
        complexity: solution.complexity,
        tags: solution.tags,
        codeBlocks: solution.codeBlocks,
        classroomId: solution.classroom,
        contestId: solution.contest
      });
      
      setMarkdownForPreview(solution.content || '');
      setHtmlContent(htmlForEditor);
      setCodeBlocks(extractedBlocks); // Use extracted blocks from markdown
      
      console.log('✅ Loaded solution with code blocks:', {
        totalBlocks: extractedBlocks.length,
        blocks: extractedBlocks.map(b => ({ lang: b.language, lines: b.code.split('\n').length }))
      });
      
      setTimeout(() => {
        setEditorKey(prev => prev + 1);
        setIsDataLoaded(true);
      }, 100);
      
    } catch (error) {
      console.error('Load solution error:', error);
      toast.error('Không thể tải solution');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (newTab) => {
    if (newTab === 'preview' && activeTab === 'edit') {
      let markdown = turndownService.turndown(htmlContent);
      
      codeBlocks.forEach(block => {
        markdown += `\n\n\`\`\`${block.language}\n${block.code}\n\`\`\`\n`;
      });
      
      setMarkdownForPreview(markdown);
      setFormData(prev => ({
        ...prev,
        content: markdown
      }));
    }
    setActiveTab(newTab);
  };

  const handleContentChange = (htmlContentValue) => {
    setHtmlContent(htmlContentValue);
  };

  const handleAddTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, tag]
    }));
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleOpenCodeEditor = () => {
    setCurrentCode('');
    setSelectedLanguage('cpp');
    setShowCodeEditor(true);
  };

  const handleCodeChange = (code) => {
    setCurrentCode(code);
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
  };

  const handleCloseCodeEditor = () => {
    setShowCodeEditor(false);
    setCurrentCode('');
  };

  const handleInsertCode = () => {
    if (!currentCode.trim()) {
      toast.error('Vui lòng nhập code');
      return;
    }

    const newBlock = {
      id: Date.now(),
      code: currentCode,
      language: selectedLanguage
    };
    
    setCodeBlocks(prev => [...prev, newBlock]);
    setShowCodeEditor(false);
    setCurrentCode('');
    toast.success('Đã thêm code block');
  };

  const handleRemoveCodeBlock = (id) => {
    setCodeBlocks(prev => prev.filter(block => block.id !== id));
    toast.success('Đã xóa code block');
  };

  const handleUpdateCodeBlock = (id, newCode) => {
    setCodeBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, code: newCode } : block
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!problemShortId) {
      toast.error('Thiếu thông tin bài tập');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }

    let finalMarkdown = turndownService.turndown(htmlContent);
    
    codeBlocks.forEach(block => {
      finalMarkdown += `\n\n\`\`\`${block.language}\n${block.code}\n\`\`\`\n`;
    });
    
    if (!finalMarkdown.trim()) {
      toast.error('Vui lòng nhập nội dung');
      return;
    }

    try {
      setLoading(true);
      
      const apiCodeBlocks = codeBlocks.map(block => ({
        language: block.language,
        code: block.code,
        explanation: ''
      }));

      const data = {
        ...formData,
        problemShortId: problemShortId,
        content: finalMarkdown,
        codeBlocks: apiCodeBlocks
      };

      if (solutionId) {
        await solutionService.updateSolution(solutionId, data);
      } else {
        await solutionService.createSolution(data);
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Thông tin cơ bản</h3>
        
        <div className="space-y-4">
          <div>
            <Label>Bài tập</Label>
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 font-medium">
              {problemShortId} - {problemName}
            </div>
          </div>

          <div>
            <Label>Tiêu đề solution</Label>
            <Input
              className="mt-2"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Giải pháp tối ưu với Dynamic Programming"
            />
          </div>

          <div>
            <Label>Phương pháp tiếp cận</Label>
            <select
              className="w-full mt-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.approach}
              onChange={(e) => setFormData({ ...formData, approach: e.target.value })}
            >
              {APPROACHES.map((approach) => (
                <option key={approach} value={approach}>
                  {approach.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Complexity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Độ phức tạp</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Time Complexity</Label>
            <Input
              className="mt-2"
              value={formData.complexity.time}
              onChange={(e) => setFormData({
                ...formData,
                complexity: { ...formData.complexity, time: e.target.value }
              })}
              placeholder="O(n)"
            />
          </div>
          <div>
            <Label>Space Complexity</Label>
            <Input
              className="mt-2"
              value={formData.complexity.space}
              onChange={(e) => setFormData({
                ...formData,
                complexity: { ...formData.complexity, space: e.target.value }
              })}
              placeholder="O(1)"
            />
          </div>
        </div>
      </Card>

      {/* Content Editor */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Nội dung Solution</h3>
          <p className="text-sm text-gray-600 mt-1">Giải thích thuật toán, ý tưởng và các bước thực hiện</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 mb-4 h-11 bg-gray-100 p-1">
            <TabsTrigger 
              value="edit" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              <Code className="w-4 h-4" />
              Viết
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="mt-0 space-y-4">
            <div>
              {loading ? (
                <div className="flex items-center justify-center h-64 border rounded-lg bg-gray-50">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Đang tải...</p>
                  </div>
                </div>
              ) : (
                <PostEditor
                  key={`editor-${editorKey}`}
                  value={htmlContent || ''}
                  onChange={handleContentChange}
                  placeholder="# Giải thích thuật toán

## Ý tưởng chính

Mô tả ý tưởng chính của thuật toán...

## Phân tích

- Điểm mạnh:
- Điểm yếu:
- Trường hợp áp dụng:

## Các bước thực hiện

1. **Bước 1**: Mô tả bước đầu tiên
2. **Bước 2**: Tiếp tục...
3. **Bước 3**: Kết thúc"
                />
              )}
            </div>

            {!loading && codeBlocks.length > 0 && (
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-semibold text-gray-900">Code Blocks ({codeBlocks.length})</h4>
                {codeBlocks.map((block, index) => (
                  <div key={`code-${block.id}`} className="border rounded-lg overflow-hidden bg-white">
                    <div className="bg-gray-100 px-4 py-2 flex items-center justify-between border-b">
                      <span className="text-sm font-semibold text-gray-700">
                        {index + 1}. {LANGUAGE_EXTENSIONS[block.language].label}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCodeBlock(block.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <CodeMirror
                      value={block.code}
                      height="300px"
                      extensions={[LANGUAGE_EXTENSIONS[block.language].extension()]}
                      theme={githubLight}
                      onChange={(val) => handleUpdateCodeBlock(block.id, val)}
                      style={{ fontSize: 14 }}
                      basicSetup={{
                        lineNumbers: true,
                        highlightActiveLineGutter: true,
                        highlightSpecialChars: true,
                        foldGutter: true,
                        drawSelection: true,
                        dropCursor: true,
                        allowMultipleSelections: true,
                        indentOnInput: true,
                        bracketMatching: true,
                        closeBrackets: true,
                        autocompletion: true,
                        rectangularSelection: true,
                        crosshairCursor: true,
                        highlightActiveLine: true,
                        highlightSelectionMatches: true,
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {!loading && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">Code Implementation</h4>
                    <p className="text-sm text-gray-600">Thêm code minh họa cho thuật toán</p>
                  </div>
                  {!showCodeEditor && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleOpenCodeEditor}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm Code Block
                    </Button>
                  )}
                </div>

                {showCodeEditor && (
                  <div className="mt-3">
                    <CodeBlockEditor
                      value={currentCode}
                      onChange={handleCodeChange}
                      onClose={handleCloseCodeEditor}
                      onInsert={handleInsertCode}
                      language={selectedLanguage}
                      onLanguageChange={handleLanguageChange}
                    />
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            <div className="min-h-[400px] p-6 border-2 border-gray-200 rounded-lg bg-white">
              <style>{`
                /* Inline code styling */
                .markdown-preview code:not(pre code) {
                  background-color: rgba(253, 230, 138, 0.5);
                  color: #b45309;
                  padding: 0.15rem 0.4rem;
                  border-radius: 0.25rem;
                  font-size: 0.9em;
                  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                  font-weight: 500;
                  border: 1px solid rgba(251, 191, 36, 0.4);
                  white-space: nowrap;
                }

                /* Headers styling */
                .markdown-preview h1 {
                  font-size: 2rem;
                  font-weight: 700;
                  margin-top: 2rem;
                  margin-bottom: 1rem;
                  padding-bottom: 0.5rem;
                  border-bottom: 3px solid #3b82f6;
                  color: #111827;
                }

                .markdown-preview h2 {
                  font-size: 1.5rem;
                  font-weight: 700;
                  margin-top: 1.75rem;
                  margin-bottom: 0.75rem;
                  padding-bottom: 0.4rem;
                  border-bottom: 2px solid #e5e7eb;
                  color: #1f2937;
                }

                .markdown-preview h3 {
                  font-size: 1.25rem;
                  font-weight: 600;
                  margin-top: 1.5rem;
                  margin-bottom: 0.5rem;
                  color: #374151;
                }

                /* Paragraph and text */
                .markdown-preview p {
                  margin: 1rem 0;
                  line-height: 1.75;
                  color: #374151;
                }

                /* Lists */
                .markdown-preview ul, .markdown-preview ol {
                  margin: 1rem 0;
                  padding-left: 2rem;
                  line-height: 1.75;
                }

                .markdown-preview ul {
                  list-style-type: disc;
                }

                .markdown-preview ol {
                  list-style-type: decimal;
                  list-style-position: outside;
                }

                .markdown-preview li {
                  margin: 0.5rem 0;
                  color: #374151;
                  padding-left: 0.5rem;
                }

                .markdown-preview li::marker {
                  color: #6b7280;
                  font-weight: 600;
                }

                /* Nested lists */
                .markdown-preview ol ol {
                  list-style-type: lower-alpha;
                  margin-top: 0.25rem;
                }

                .markdown-preview ol ol ol {
                  list-style-type: lower-roman;
                }

                .markdown-preview ul ul {
                  list-style-type: circle;
                  margin-top: 0.25rem;
                }

                .markdown-preview ul ul ul {
                  list-style-type: square;
                }

                /* Links */
                .markdown-preview a {
                  color: #2563eb;
                  text-decoration: underline;
                  font-weight: 500;
                }

                .markdown-preview a:hover {
                  color: #1d4ed8;
                }

                /* Code blocks with line numbers */
                .code-block-wrapper {
                  margin: 1.5rem 0;
                  border-radius: 0.5rem;
                  overflow: hidden;
                  border: 1px solid #e5e7eb;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .code-block-header {
                  background: linear-gradient(to right, #1e293b, #334155);
                  color: white;
                  padding: 0.75rem 1rem;
                  font-size: 0.75rem;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                  display: flex;
                  align-items: center;
                  gap: 0.5rem;
                }

                .code-block-content {
                  background: #282c34;
                  position: relative;
                  overflow-x: auto;
                }

                .code-block-content pre {
                  margin: 0 !important;
                  padding: 0 !important;
                  background: transparent !important;
                  overflow: visible !important;
                  display: flex;
                }

                .line-numbers {
                  padding: 1rem 0;
                  text-align: right;
                  user-select: none;
                  color: #636d83;
                  background: #21252b;
                  border-right: 1px solid #3e4451;
                  min-width: 3rem;
                  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                  font-size: 0.875rem;
                  line-height: 1.5;
                }

                .line-numbers span {
                  display: block;
                  padding: 0 0.75rem;
                }

                .code-content {
                  flex: 1;
                  padding: 1rem;
                  overflow-x: auto;
                }

                .code-content code {
                  background: transparent !important;
                  color: #abb2bf !important;
                  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                  font-size: 0.875rem !important;
                  line-height: 1.5 !important;
                  display: block;
                  white-space: pre;
                }

                /* Table styling */
                .markdown-preview table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 1.5rem 0;
                  border: 1px solid #e5e7eb;
                  border-radius: 0.5rem;
                  overflow: hidden;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .markdown-preview thead {
                  background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
                }

                .markdown-preview th {
                  padding: 0.75rem 1rem;
                  text-align: left;
                  font-weight: 600;
                  font-size: 0.875rem;
                  color: #374151;
                  border-bottom: 2px solid #d1d5db;
                  text-transform: uppercase;
                  letter-spacing: 0.025em;
                }

                .markdown-preview td {
                  padding: 0.75rem 1rem;
                  border-bottom: 1px solid #e5e7eb;
                  color: #4b5563;
                }

                .markdown-preview tbody tr:hover {
                  background-color: #f9fafb;
                }

                .markdown-preview tbody tr:last-child td {
                  border-bottom: none;
                }

                /* Blockquote */
                .markdown-preview blockquote {
                  border-left: 4px solid #3b82f6;
                  padding-left: 1rem;
                  margin: 1.5rem 0;
                  color: #6b7280;
                  font-style: italic;
                }

                /* Images */
                .markdown-preview img {
                  max-width: 100%;
                  height: auto;
                  border-radius: 0.5rem;
                  margin: 1.5rem 0;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }

                /* Math (KaTeX) */
                .markdown-preview .katex {
                  font-size: 1.1em;
                }

                .markdown-preview .katex-display {
                  margin: 1.5rem 0;
                  overflow-x: auto;
                  overflow-y: hidden;
                }

                /* Horizontal rule */
                .markdown-preview hr {
                  border: none;
                  border-top: 2px solid #e5e7eb;
                  margin: 2rem 0;
                }

                /* Strong and emphasis */
                .markdown-preview strong {
                  font-weight: 700;
                  color: #111827;
                }

                .markdown-preview em {
                  font-style: italic;
                }
              `}</style>

              <div className="markdown-preview">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
                  components={{
                    h1({ children }) {
                      return <h1>{children}</h1>;
                    },
                    h2({ children }) {
                      return <h2>{children}</h2>;
                    },
                    h3({ children }) {
                      return <h3>{children}</h3>;
                    },
                    table({ children }) {
                      return (
                        <div className="overflow-x-auto">
                          <table>{children}</table>
                        </div>
                      );
                    },
                    code({ inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      
                      if (!inline && match) {
                        const code = String(children).replace(/\n$/, '');
                        const lines = code.split('\n');
                        const lineNumbers = lines.map((_, i) => i + 1);

                        return (
                          <div className="code-block-wrapper">
                            <div className="code-block-header">
                              <Code2 className="w-4 h-4" />
                              {match[1].toUpperCase()}
                            </div>
                            <div className="code-block-content">
                              <pre>
                                <div className="line-numbers">
                                  {lineNumbers.map(num => (
                                    <span key={num}>{num}</span>
                                  ))}
                                </div>
                                <div className="code-content">
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                </div>
                              </pre>
                            </div>
                          </div>
                        );
                      }

                      return inline ? (
                        <code {...props}>{children}</code>
                      ) : (
                        <code className={className} {...props}>{children}</code>
                      );
                    }
                  }}
                >
                  {markdownForPreview || '*Chưa có nội dung. Bắt đầu viết solution của bạn...*'}
                </ReactMarkdown>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Tags */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Tags</h3>
        <TagsInput
          tags={formData.tags}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          maxTags={10}
        />
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3 sticky bottom-0 bg-white border-t py-4 px-6 -mx-6 shadow-lg">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={loading}
        >
          Hủy
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'Đang xử lý...' : (solutionId ? 'Cập nhật Solution' : 'Tạo Solution')}
        </Button>
      </div>
    </form>
  );
};

export default SolutionForm;