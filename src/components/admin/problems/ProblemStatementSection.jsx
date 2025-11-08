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


const ProblemStatementSection = ({
  formData,
  onFormDataChange,
  onAddExample,
  onRemoveExample,
  onExampleChange,
  difficultyOptions
}) => {
  const [activeEditor, setActiveEditor] = useState(null);
  console.log('Data: ', formData);
  return (
    <div className="p-8 space-y-8">
      {/* Basic Information */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Thông tin cơ bản
          </h3>
          
          <div className="space-y-4">
            {/* Problem Name */}
            <div>
              <Label htmlFor="name" className="text-lg font-medium text-gray-700">
                Tên bài tập <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onFormDataChange('name', e.target.value)}
                placeholder="VD: Người chiến thắng trong trò chơi bài"
                className="mt-1"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.name.length}/200 ký tự
              </p>
            </div>

            {/* Difficulty */}
            <div className=' mt-4'>
              <Label className="text-lg font-medium text-gray-700 mb-2 block">
                Độ khó <span className="text-red-500">*</span>
              </Label>
              <div className="flex space-x-3">
                {difficultyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onFormDataChange('difficulty', option.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      formData.difficulty === option.value
                        ? option.color + ' ring-2 ring-offset-2'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Statement */}
        <div className=' mt-4'>
          <Label className="text-lg font-medium text-gray-700 mb-2 flex items-center">
            <Code className="h-4 w-4 mr-2" />
            Đề bài <span className="text-red-500 ml-1">*</span>
          </Label>
          <PostEditor
            value={formData.statement}
            onChange={(value) => {
              onFormDataChange('statement', value)
            }}
            // onImageUpload={handleEditorImageUpload}
            placeholder="Đề bài hôm nay..."
          />
        </div>

        {/* Input Description */}
        <div>
          <Label className="text-lg font-medium text-gray-700 mb-2 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Mô tả Input <span className="text-red-500 ml-1">*</span>
          </Label>
          <PostEditor
            value={formData.input}
            onChange={(value) => onFormDataChange('input', value)}

            // onImageUpload={handleEditorImageUpload}
            placeholder="Đề bài hôm nay..."
          />
        </div>

        {/* Output Description */}
        <div>
          <Label className="text-lg font-medium text-gray-700 mb-2 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Mô tả Output <span className="text-red-500 ml-1">*</span>
          </Label>
          <PostEditor
            value={formData.output}
            onChange={(value) => onFormDataChange('output', value)}
            // onImageUpload={handleEditorImageUpload}
            placeholder="Đề bài hôm nay..."
          />
        </div>

        {/* Examples */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="text-lg font-medium text-gray-700 flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Ví dụ minh họa
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddExample}
              className="text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Thêm ví dụ
            </Button>
          </div>

          <div className="space-y-4">
            {formData.examplesInput.map((_, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-gray-700">
                    Ví dụ {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveExample(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">Input</Label>
                    <textarea
                      value={formData.examplesInput[index]}
                      onChange={(e) => onExampleChange(index, 'input', e.target.value)}
                      placeholder="Input example..."
                      className="w-full p-2 border rounded-md text-sm font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">Output</Label>
                    <textarea
                      value={formData.examplesOutput[index]}
                      onChange={(e) => onExampleChange(index, 'output', e.target.value)}
                      placeholder="Output example..."
                      className="w-full p-2 border rounded-md text-sm font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Tag className="h-4 w-4 mr-2" />
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Giới hạn</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="time" className="text-sm font-medium text-gray-700 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
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
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">0.1 - 10 giây</p>
            </div>

            <div>
              <Label htmlFor="memory" className="text-sm font-medium text-gray-700 flex items-center">
                <HardDrive className="h-4 w-4 mr-2" />
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
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">128 - 2048 MB</p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-gray-700">Bài tập riêng tư</Label>
                <p className="text-xs text-gray-500 mt-1">
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
                <Label className="text-sm font-medium text-gray-700">Hiển thị dạng PDF</Label>
                <p className="text-xs text-gray-500 mt-1">
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