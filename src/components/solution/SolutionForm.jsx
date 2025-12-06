import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import TurndownService from 'turndown';
import 'highlight.js/styles/github.css'; // Changed to light theme
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
import { Eye, Code, Plus, Trash2 } from 'lucide-react';
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
  
  // Store HTML content and code blocks separately
  const [htmlContent, setHtmlContent] = useState('');
  const [codeBlocks, setCodeBlocks] = useState([]); // [{code, language, id}]
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
      setIsDataLoaded(false); // Reset before loading
      
      const response = await solutionService.getSolutionById(solutionId);
      const solution = response.data;
      
      console.log('Loading solution:', solution);
      
      // Remove code blocks from content to get only text
      let textContent = solution.content || '';
      const codeBlockRegex = /```(\w+)\n([\s\S]*?)```/g;
      textContent = textContent.replace(codeBlockRegex, '').trim();
      
      console.log('Text content:', textContent);
      
      // Convert markdown to HTML
      marked.setOptions({
        breaks: true,
        gfm: true,
      });
      
      const htmlForEditor = marked.parse(textContent);
      console.log('HTML for editor:', htmlForEditor);
      
      // Load code blocks from API
      let loadedBlocks = [];
      if (solution.codeBlocks && solution.codeBlocks.length > 0) {
        loadedBlocks = solution.codeBlocks.map((block, index) => ({
          id: Date.now() + index,
          code: block.code,
          language: block.language
        }));
        console.log('Loaded code blocks:', loadedBlocks);
      }
      
      // Update all states
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
      
      // Use callback to ensure state updates
      setHtmlContent(htmlForEditor);
      setCodeBlocks(loadedBlocks);
      
      // Force editor to re-render after state is set
      setTimeout(() => {
        setEditorKey(prev => prev + 1);
        setIsDataLoaded(true);
        console.log('States updated, editor key:', editorKey + 1);
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
      // Convert current HTML to Markdown for preview
      let markdown = turndownService.turndown(htmlContent);
      
      // Append code blocks
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

    // Add to code blocks array
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

    // Convert HTML to Markdown
    let finalMarkdown = turndownService.turndown(htmlContent);
    
    // Append code blocks to markdown for display
    codeBlocks.forEach(block => {
      finalMarkdown += `\n\n\`\`\`${block.language}\n${block.code}\n\`\`\`\n`;
    });
    
    if (!finalMarkdown.trim()) {
      toast.error('Vui lòng nhập nội dung');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare code blocks data for API (without id)
      const apiCodeBlocks = codeBlocks.map(block => ({
        language: block.language,
        code: block.code,
        explanation: '' // You can add explanation field if needed
      }));

      const data = {
        ...formData,
        problemShortId: problemShortId,
        content: finalMarkdown,
        codeBlocks: apiCodeBlocks // Send codeBlocks array
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
            {/* PostEditor for Algorithm Explanation */}
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

            {/* Display existing code blocks */}
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

            {/* Add Code Block Button & Editor */}
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
                .prose-preview {
                  color: #374151;
                  line-height: 1.75;
                  max-width: none;
                }
                .prose-preview h1 {
                  font-size: 2em;
                  font-weight: 700;
                  margin-top: 1.5rem;
                  margin-bottom: 1rem;
                  color: #111827;
                  line-height: 1.2;
                }
                .prose-preview h2 {
                  font-size: 1.5em;
                  font-weight: 700;
                  margin-top: 1.25rem;
                  margin-bottom: 0.75rem;
                  padding-bottom: 0.5rem;
                  border-bottom: 2px solid #e5e7eb;
                  color: #111827;
                  line-height: 1.3;
                }
                .prose-preview h3 {
                  font-size: 1.25em;
                  font-weight: 600;
                  margin-top: 1rem;
                  margin-bottom: 0.5rem;
                  color: #111827;
                  line-height: 1.4;
                }
                .prose-preview p {
                  margin-top: 0.75rem;
                  margin-bottom: 0.75rem;
                  color: #374151;
                  line-height: 1.75;
                }
                .prose-preview ul {
                  list-style-type: disc;
                  list-style-position: outside;
                  padding-left: 2rem;
                  margin-top: 0.75rem;
                  margin-bottom: 0.75rem;
                }
                .prose-preview ol {
                  list-style-type: decimal;
                  list-style-position: outside;
                  padding-left: 2rem;
                  margin-top: 0.75rem;
                  margin-bottom: 0.75rem;
                }
                .prose-preview li {
                  margin-top: 0.5rem;
                  margin-bottom: 0.5rem;
                  padding-left: 0.5rem;
                  color: #374151;
                  line-height: 1.75;
                  display: list-item;
                }
                .prose-preview li::marker {
                  color: #6b7280;
                }
                .prose-preview li p {
                  display: inline;
                  margin: 0;
                }
                .prose-preview li > p:only-child {
                  display: inline;
                }
                .prose-preview strong {
                  font-weight: 600;
                  color: #111827;
                }
                .prose-preview code:not(pre code) {
                  background-color: #f3f4f6;
                  color: #dc2626;
                  padding: 0.125rem 0.375rem;
                  border-radius: 0.25rem;
                  font-size: 0.875em;
                  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                  font-weight: 500;
                  display: inline;
                  white-space: nowrap;
                }
                .prose-preview pre {
                  margin-top: 1rem;
                  margin-bottom: 1rem;
                  border-radius: 0.5rem;
                  overflow: hidden;
                  background-color: #f6f8fa;
                  border: 1px solid #e5e7eb;
                }
                .prose-preview pre code {
                  display: block;
                  padding: 1rem;
                  overflow-x: auto;
                  font-size: 0.875rem;
                  line-height: 1.7;
                  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                  background: transparent;
                  color: #24292e;
                  white-space: pre;
                }
                /* Nested lists */
                .prose-preview li > * {
                  display: inline;
                }
                .prose-preview li > ul,
                .prose-preview li > ol {
                  display: block;
                }
              `}</style>
              <div className="prose-preview">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline ? (
                        <div className="relative my-4 border rounded-lg overflow-hidden">
                          {match && (
                            <div className="bg-gray-100 text-gray-700 px-4 py-2 text-xs font-semibold uppercase border-b">
                              {match[1]}
                            </div>
                          )}
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </div>
                      ) : (
                        <code {...props}>
                          {children}
                        </code>
                      );
                    },
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