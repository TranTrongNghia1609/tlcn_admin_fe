import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/atom-one-dark.css';
import 'katex/dist/katex.min.css';

import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import solutionService from '../../services/solutionService';
import { toast } from 'sonner';
import { Code2, Eye } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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

const SolutionForm = ({
  solutionId = null,
  problemShortId = null,
  problemName = '',
  onSuccess,
  onCancel,
  viewMode = true // Default to view mode
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    approach: 'brute-force',
    complexity: {
      time: 'O(n)',
      space: 'O(1)'
    },
    tags: [],
    codeBlocks: []
  });
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    if (solutionId) {
      loadSolution();
    }
  }, [solutionId]);

  const loadSolution = async () => {
    try {
      setLoading(true);

      const response = await solutionService.getSolutionById(solutionId);
      const solution = response.data;

      // Check if current user is the author
      const currentUserId = user?.id;
      const solutionAuthorId = solution.author?._id || solution.author?.id;
      const isUserAuthor = currentUserId === solutionAuthorId;

      setIsAuthor(isUserAuthor);

      setFormData({
        title: solution.title,
        content: solution.content,
        approach: solution.approach,
        complexity: solution.complexity,
        tags: solution.tags || [],
        codeBlocks: solution.codeBlocks || []
      });

      console.log('✅ Loaded solution for view:', {
        solutionId,
        isAuthor: isUserAuthor,
        hasContent: !!solution.content
      });

    } catch (error) {
      console.error('❌ Load solution error:', error);
      toast.error('Không thể tải solution');
      if (onCancel) {
        setTimeout(() => onCancel(), 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải solution...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Mode Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Eye className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Chế độ xem.</strong> Bạn đang xem solution này.
            </p>
          </div>
        </div>
      </div>

      {/* Basic Info - Read Only */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Thông tin cơ bản</h3>

        <div className="space-y-4">
          <div>
            <Label className="text-gray-700">Bài tập</Label>
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 font-medium">
              {problemShortId} - {problemName}
            </div>
          </div>

          <div>
            <Label className="text-gray-700">Tiêu đề solution</Label>
            <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 font-medium">
              {formData.title || 'Chưa có tiêu đề'}
            </div>
          </div>

          <div>
            <Label className="text-gray-700">Phương pháp tiếp cận</Label>
            <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <Badge variant="outline" className="text-sm">
                {formData.approach.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Complexity - Read Only */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Độ phức tạp</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-700">Time Complexity</Label>
            <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md font-mono text-sm">
              {formData.complexity.time || 'N/A'}
            </div>
          </div>
          <div>
            <Label className="text-gray-700">Space Complexity</Label>
            <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md font-mono text-sm">
              {formData.complexity.space || 'N/A'}
            </div>
          </div>
        </div>
      </Card>

      {/* Content Preview */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Nội dung Solution</h3>
        </div>

        <div className="min-h-[400px] p-6 border-2 border-gray-200 rounded-lg bg-white">
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
              {formData.content || '*Chưa có nội dung solution...*'}
            </ReactMarkdown>
          </div>
        </div>
      </Card>

      {/* Tags - Read Only */}
      {formData.tags && formData.tags.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                {tag}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Close Button */}
      <div className="flex justify-end gap-3 sticky bottom-0 bg-white border-t py-4 shadow-lg">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="cursor-pointer"
        >
          Đóng
        </Button>
      </div>
    </div>
  );
};

export default SolutionForm;