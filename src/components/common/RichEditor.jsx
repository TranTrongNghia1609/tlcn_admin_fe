import React, { useState, useRef } from 'react';
import PostEditor from '@/components/home/CreatePostComponent/PostEditor';
import { Button } from '@/components/ui/button';
import { Eye, Edit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder,
  isActive,
  onFocus,
  onBlur
}) => {
  const [mode, setMode] = useState('edit'); // edit or preview
  const editorRef = useRef(null);

  const handleImageUpload = async (file) => {
    // TODO: Implement image upload to your backend
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 font-medium">
            {mode === 'edit' ? 'Chế độ chỉnh sửa' : 'Chế độ xem trước'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant={mode === 'edit' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('edit')}
            className="text-xs"
          >
            <Edit className="h-3 w-3 mr-1" />
            Chỉnh sửa
          </Button>
          <Button
            type="button"
            variant={mode === 'preview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('preview')}
            className="text-xs"
          >
            <Eye className="h-3 w-3 mr-1" />
            Xem trước
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white">
        {mode === 'edit' ? (
          <div 
            ref={editorRef}
            onFocus={onFocus}
            onBlur={onBlur}
          >
            <PostEditor
              value={value}
              onChange={onChange}
              onImageUpload={handleImageUpload}
              placeholder={placeholder}
            />
          </div>
        ) : (
          <div className="p-4 prose prose-sm max-w-none min-h-[200px]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                code: ({ node, inline, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline ? (
                    <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm" {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {value || '*Không có nội dung để xem trước*'}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Character count */}
      {mode === 'edit' && (
        <div className="bg-gray-50 border-t px-4 py-2">
          <span className="text-xs text-gray-500">
            {value.length} ký tự
          </span>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;