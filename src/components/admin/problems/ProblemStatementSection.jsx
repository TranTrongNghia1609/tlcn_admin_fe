import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Trash2,
  Code,
  FileText,
  Tag,
  Clock,
  HardDrive,
  Eye,
  Image as ImageIcon
} from 'lucide-react';
import TagsInput from '@/components/home/CreatePostComponent/TagsInput';
import { Switch } from '@/components/ui/switch';
import RichTextEditor from '@/components/common/RichEditor';
import PostEditor from '@/components/home/CreatePostComponent/PostEditor';

import remarkMath from 'remark-math';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
const ProblemStatementSection = ({
  formData,
  onFormDataChange,
  onAddExample,
  onRemoveExample,
  onExampleChange,
  difficultyOptions
}) => {
  const [activeEditor, setActiveEditor] = useState(null);
  return (
    <div className="p-2 md:p-4 space-y-8 text-slate-800 dark:text-slate-100">
      {/* Basic Information */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center border-b border-slate-100 dark:border-slate-700/50 pb-2">
            <FileText className="h-5 w-5 mr-2 text-blue-500" />
            Thông tin cơ bản
          </h3>

          <div className="space-y-4">
            {/* Problem Name */}
            <div>
              <Label htmlFor="name" className="text-sm font-bold text-gray-700 dark:text-slate-300">
                Tên bài tập <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onFormDataChange('name', e.target.value)}
                placeholder="VD: Người chiến thắng trong trò chơi bài"
                className="mt-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                {formData.name.length}/200 ký tự
              </p>
            </div>

            {/* Difficulty */}
            <div className=' mt-4'>
              <Label className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 block">
                Độ khó <span className="text-red-500">*</span>
              </Label>
              <div className="flex space-x-3">
                {difficultyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onFormDataChange('difficulty', option.value)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${formData.difficulty === option.value
                      ? option.color + ' ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-800'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className=' mt-4'>
              <Label htmlFor="rating" className="text-sm font-bold text-gray-700 dark:text-slate-300">
                Rating (100 - 1000) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="rating"
                type="number"
                min={100}
                max={1000}
                value={formData.rating || ''}
                onChange={(e) => onFormDataChange('rating', parseInt(e.target.value) || '')}
                placeholder="VD: 800"
                className="mt-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500"
              />

            </div>
          </div>
        </div>

        {/* Statement */}
        <div className=' mt-4'>
          <Label className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 flex items-center">
            <Code className="h-4 w-4 mr-2 text-indigo-500" />
            Đề bài <span className="text-red-500 ml-1">*</span>
          </Label>
          <PostEditor
            value={formData.statement}
            onChange={(value) => {
              console.log(formData.statement)
              onFormDataChange('statement', value)
            }}
            placeholder="Đề bài hôm nay..."
          />
        </div>

        {/* Input Description */}
        <div>
          <Label className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 flex items-center">
            <FileText className="h-4 w-4 mr-2 text-teal-500" />
            Mô tả Input <span className="text-red-500 ml-1">*</span>
          </Label>

          <PostEditor
            value={formData.input}
            onChange={(value) => onFormDataChange('input', value)}
            placeholder="Đề bài hôm nay..."
          />
        </div>

        {/* Output Description */}
        <div>
          <Label className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 flex items-center">
            <FileText className="h-4 w-4 mr-2 text-pink-500" />
            Mô tả Output <span className="text-red-500 ml-1">*</span>
          </Label>
          <PostEditor
            value={formData.output}
            onChange={(value) => onFormDataChange('output', value)}
            placeholder="Đề bài hôm nay..."
          />
        </div>

        {/* Examples */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="text-sm font-bold text-gray-700 dark:text-slate-300 flex items-center">
              <Eye className="h-4 w-4 mr-2 text-cyan-500" />
              Ví dụ minh họa
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddExample}
              className="text-blue-600 hover:text-blue-700 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl font-bold px-3 py-1.5"
            >
              <Plus className="h-4 w-4 mr-1" />
              Thêm ví dụ
            </Button>
          </div>

          <div className="space-y-4">
            {formData.examplesInput.map((_, index) => (
              <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-700 dark:text-slate-300">
                    Ví dụ {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveExample(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1 block">Input</Label>
                    <textarea
                      value={formData.examplesInput[index]?.replace(/\\n/g, '\n').replace(/\n/g, '  \n')}
                      onChange={(e) => onExampleChange(index, 'input', e.target.value)}
                      placeholder="Input example..."
                      className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono resize-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1 block">Output</Label>
                    <textarea
                      value={formData.examplesOutput[index]?.replace(/\\n/g, '\n').replace(/\n/g, '  \n')}
                      onChange={(e) => onExampleChange(index, 'output', e.target.value)}
                      placeholder="Output example..."
                      className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono resize-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <Label className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 flex items-center">
            <Tag className="h-4 w-4 mr-2 text-amber-500" />
            Tags <span className="text-red-500 ml-1">*</span>
          </Label>
          <TagsInput
            tags={formData.tags}
            onAddTag={(tag) => onFormDataChange('tags', [...formData.tags, tag])}
            onRemoveTag={(tagToRemove) =>
              onFormDataChange('tags', formData.tags.filter(tag => tag !== tagToRemove))
            }
            maxTags={10}
            placeholder="VD: math, string, dynamic-programming..."
          />
        </div>

        {/* Constraints */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700/50 pb-2">Giới hạn</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="time" className="text-sm font-bold text-gray-700 dark:text-slate-300 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                Time Limit (giây) <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="time"
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                value={formData.time}
                onChange={(e) => onFormDataChange('time', parseFloat(e.target.value))}
                className="mt-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">0.1 - 10 giây</p>
            </div>

            <div>
              <Label htmlFor="memory" className="text-sm font-bold text-gray-700 dark:text-slate-300 flex items-center">
                <HardDrive className="h-4 w-4 mr-2 text-indigo-500" />
                Memory Limit (MB) <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="memory"
                type="number"
                min="128"
                max="2048"
                step="128"
                value={formData.memory}
                onChange={(e) => onFormDataChange('memory', parseInt(e.target.value))}
                className="mt-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">128 - 2048 MB</p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Cài đặt</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-bold text-gray-700 dark:text-slate-300">Bài tập riêng tư</Label>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Chỉ admin và người được phân quyền mới thấy
                </p>
              </div>
              <Switch
                checked={formData.isPrivate}
                onCheckedChange={(checked) => onFormDataChange('isPrivate', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-bold text-gray-700 dark:text-slate-300">Hiển thị dạng PDF</Label>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Đề bài sẽ được hiển thị dưới dạng PDF
                </p>
              </div>
              <Switch
                checked={formData.isPdf}
                onCheckedChange={(checked) => onFormDataChange('isPdf', checked)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemStatementSection;