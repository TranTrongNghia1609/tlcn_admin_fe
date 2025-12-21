import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  X,
  Plus,
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Code2,
  FileEdit,
  FilePlus,
  Upload,
  FileText
} from 'lucide-react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/atom-one-dark.css';
import 'katex/dist/katex.min.css';

const AdminSolutionEditor = ({
  problemShortId,
  problemName,
  solutionId = null,
  initialData = null,
  onSubmit,
  submitting,
  onCancel,
  isEditMode = false
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: `# Hướng giải quyết
<!-- Mô tả ý tưởng chính -->

# Thuật toán
<!-- Mô tả chi tiết thuật toán -->

# Độ phức tạp
- Time complexity: $$O(n)$$
- Space complexity: $$O(1)$$

# Code
\`\`\`cpp
class Solution {
public:
    // Your solution here
};
\`\`\``,
    approach: 'other',
    complexity: { time: '', space: '' },
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  
  // ✅ NEW: Ref for file input
  const fileInputRef = useRef(null);

  const approaches = [
    { value: 'brute-force', label: 'Brute Force' },
    { value: 'greedy', label: 'Greedy' },
    { value: 'dynamic-programming', label: 'Dynamic Programming' },
    { value: 'divide-conquer', label: 'Divide & Conquer' },
    { value: 'backtracking', label: 'Backtracking' },
    { value: 'graph', label: 'Graph' },
    { value: 'tree', label: 'Tree' },
    { value: 'sorting', label: 'Sorting' },
    { value: 'searching', label: 'Searching' },
    { value: 'math', label: 'Math' },
    { value: 'string', label: 'String' },
    { value: 'array', label: 'Array' },
    { value: 'other', label: 'Other' }
  ];

  const languages = [
    'C++', 'Java', 'Python', 'Python3', 'C', 'C#', 'JavaScript',
    'TypeScript', 'PHP', 'Swift', 'Kotlin', 'Dart', 'Go',
    'Ruby', 'Scala', 'Rust'
  ];

  useEffect(() => {
    if (initialData) {
      console.log('📝 Loading initial data for edit:', initialData);
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        approach: initialData.approach || 'other',
        complexity: {
          time: initialData.complexity?.time || '',
          space: initialData.complexity?.space || ''
        },
        tags: initialData.tags || []
      });
    }
  }, [initialData]);

  // ✅ NEW: Handle file import
  const handleFileImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file extension
    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      toast.error('Vui lòng chọn file Markdown (.md hoặc .markdown)');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        if (typeof content === 'string') {
          setFormData(prev => ({ ...prev, content }));
          
          // Auto-generate title from filename if title is empty
          if (!formData.title.trim()) {
            const fileName = file.name.replace(/\.(md|markdown)$/i, '');
            setFormData(prev => ({ ...prev, title: fileName }));
          }
          
          toast.success('Đã import file Markdown thành công');
        }
      } catch (error) {
        console.error('Error reading file:', error);
        toast.error('Không thể đọc file. Vui lòng thử lại');
      }
    };

    reader.onerror = () => {
      toast.error('Lỗi khi đọc file');
    };

    reader.readAsText(file);
    
    // Reset input để có thể import lại cùng file
    event.target.value = '';
  };

  // ✅ NEW: Trigger file input
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // ✅ NEW: Export to MD file
  const handleExportToMD = () => {
    if (!formData.content.trim()) {
      toast.error('Không có nội dung để export');
      return;
    }

    try {
      const blob = new Blob([formData.content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const fileName = formData.title.trim() 
        ? `${formData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`
        : 'solution.md';
      
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Đã export file Markdown');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Không thể export file');
    }
  };

  const insertMarkdown = (syntax, placeholder = '') => {
    const textarea = document.getElementById('solution-content');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end) || placeholder;

    let newText = '';
    let cursorOffset = 0;

    switch (syntax) {
      case 'bold': newText = `**${selectedText}**`; cursorOffset = 2; break;
      case 'italic': newText = `*${selectedText}*`; cursorOffset = 1; break;
      case 'code': newText = `\`${selectedText}\``; cursorOffset = 1; break;
      case 'link': newText = `[${selectedText || 'text'}](url)`; cursorOffset = selectedText ? selectedText.length + 3 : 6; break;
      case 'image': newText = `![${selectedText || 'alt'}](url)`; cursorOffset = selectedText ? selectedText.length + 4 : 5; break;
      case 'ul': newText = `\n- ${selectedText || 'item'}\n`; cursorOffset = 4; break;
      case 'ol': newText = `\n1. ${selectedText || 'item'}\n`; cursorOffset = 5; break;
      case 'h1': newText = `\n# ${selectedText || 'Heading'}\n`; cursorOffset = 3; break;
      case 'h2': newText = `\n## ${selectedText || 'Heading'}\n`; cursorOffset = 4; break;
      case 'h3': newText = `\n### ${selectedText || 'Heading'}\n`; cursorOffset = 5; break;
      case 'codeblock':
        newText = `\n\`\`\`cpp\n${selectedText || '// code'}\n\`\`\`\n`;
        cursorOffset = 10;
        break;
      default: return;
    }

    const newContent = formData.content.slice(0, start) + newText + formData.content.slice(end);
    setFormData(prev => ({ ...prev, content: newContent }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
    }, 0);
  };

  const insertLanguageTemplate = (language) => {
    insertMarkdown('codeblock');
    setTimeout(() => {
      const textarea = document.getElementById('solution-content');
      const val = textarea.value;
      const pos = textarea.selectionStart;

      for (let i = pos; i >= 0; i--) {
        if (val.substring(i, i + 3) === '```') {
          const newVal = val.slice(0, i + 3) + language.toLowerCase() + val.slice(i + 3);
          setFormData(prev => ({ ...prev, content: newVal }));
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(i + 3 + language.length + 1, i + 3 + language.length + 1);
          }, 0);
          break;
        }
      }
    }, 10);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim()) && formData.tags.length < 5) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Vui lòng nhập nội dung');
      return;
    }

    if (!formData.complexity.time || !formData.complexity.space) {
      toast.error('Vui lòng nhập độ phức tạp');
      return;
    }

    onSubmit({
      ...formData,
      problemShortId,
      ...(solutionId && { solutionId })
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown"
        onChange={handleFileImport}
        className="hidden"
      />

      {/* Header với Problem Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {isEditMode ? (
                <FileEdit className="w-6 h-6 text-orange-600" />
              ) : (
                <FilePlus className="w-6 h-6 text-blue-600" />
              )}
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Chỉnh sửa Solution' : 'Tạo Solution Mới'}
              </h2>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-700">Cho bài tập:</span>
              <Badge variant="outline" className="bg-white">
                {problemShortId}
              </Badge>
              <span className="text-gray-600 font-medium">{problemName}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {isEditMode && (
              <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                <FileEdit className="w-3 h-3 mr-1" />
                Đang chỉnh sửa
              </Badge>
            )}
            
            {/* ✅ NEW: Import/Export buttons */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleImportClick}
              disabled={submitting}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Import MD
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportToMD}
              disabled={submitting || !formData.content.trim()}
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              Export MD
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden border rounded-lg">
        {/* LEFT - Editor */}
        <div className="w-1/2 overflow-y-auto bg-white border-r">
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label>Title <span className="text-red-500">*</span></Label>
              <Input
                value={formData.title}
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                placeholder="VD: Dynamic Programming Solution - O(n²)"
                disabled={submitting}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Approach <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.approach}
                  onValueChange={v => setFormData(p => ({ ...p, approach: v }))}
                  disabled={submitting}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {approaches.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time <span className="text-red-500">*</span></Label>
                <Input
                  className="font-mono"
                  placeholder="O(n log n)"
                  value={formData.complexity.time}
                  onChange={e => setFormData(p => ({ ...p, complexity: { ...p.complexity, time: e.target.value } }))}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label>Space <span className="text-red-500">*</span></Label>
                <Input
                  className="font-mono"
                  placeholder="O(1)"
                  value={formData.complexity.space}
                  onChange={e => setFormData(p => ({ ...p, complexity: { ...p.complexity, space: e.target.value } }))}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags (tối đa 5)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập tag và nhấn Enter"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  disabled={submitting}
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  disabled={formData.tags.length >= 5 || submitting}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => !submitting && handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Content <span className="text-red-500">*</span></Label>
                {/* ✅ NEW: Import button in content section */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleImportClick}
                  disabled={submitting}
                  className="text-xs gap-1 h-7"
                >
                  <Upload className="w-3 h-3" />
                  Import file MD
                </Button>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 border-b p-2 flex flex-wrap gap-1 items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => insertMarkdown('bold')}
                    title="Bold"
                    disabled={submitting}
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => insertMarkdown('italic')}
                    title="Italic"
                    disabled={submitting}
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => insertMarkdown('code')}
                    title="Code"
                    disabled={submitting}
                  >
                    <Code className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-6 bg-gray-300 mx-1" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => insertMarkdown('h1')}
                    disabled={submitting}
                  >
                    H1
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => insertMarkdown('h2')}
                    disabled={submitting}
                  >
                    H2
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => insertMarkdown('h3')}
                    disabled={submitting}
                  >
                    H3
                  </Button>
                  <div className="w-px h-6 bg-gray-300 mx-1" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => insertMarkdown('ul')}
                    disabled={submitting}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => insertMarkdown('ol')}
                    disabled={submitting}
                  >
                    <ListOrdered className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-6 bg-gray-300 mx-1" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => insertMarkdown('link')}
                    disabled={submitting}
                  >
                    <LinkIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => insertMarkdown('image')}
                    disabled={submitting}
                  >
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-6 bg-gray-300 mx-1" />
                  <Select
                    onValueChange={insertLanguageTemplate}
                    disabled={submitting}
                  >
                    <SelectTrigger className="h-8 w-32 text-xs">
                      <SelectValue placeholder="Code block" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  id="solution-content"
                  className="min-h-96 font-mono text-sm resize-none border-0 focus:ring-0"
                  value={formData.content}
                  onChange={e => setFormData(p => ({ ...p, content: e.target.value }))}
                  placeholder="Viết solution bằng Markdown hoặc import file .md..."
                  disabled={submitting}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - Preview */}
        <div className="w-1/2 overflow-y-auto bg-white">
          <div className="px-8 py-6">
            <div className="markdown-preview">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
                components={{
                  h1({ children }) { return <h1>{children}</h1>; },
                  h2({ children }) { return <h2>{children}</h2>; },
                  h3({ children }) { return <h3>{children}</h3>; },
                  table({ children }) {
                    return <div className="overflow-x-auto"><table>{children}</table></div>;
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
                                {lineNumbers.map(num => <span key={num}>{num}</span>)}
                              </div>
                              <div className="code-content">
                                <code className={className} {...props}>{children}</code>
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
                {formData.content || '*Preview sẽ hiện ở đây...*'}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 bg-white border py-4 px-6 rounded">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
          className="cursor-pointer hover:bg-gray-100"
        >
          Hủy
        </Button>

        <Button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 cursor-pointer min-w-[180px]"
        >
          {submitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {isEditMode ? 'Đang cập nhật...' : 'Đang tạo...'}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {isEditMode ? (
                <>
                  <FileEdit className="w-4 h-4" />
                  Cập nhật Solution
                </>
              ) : (
                <>
                  <FilePlus className="w-4 h-4" />
                  Tạo Solution
                </>
              )}
            </div>
          )}
        </Button>
      </div>
    </form>
  );
};

export default AdminSolutionEditor;