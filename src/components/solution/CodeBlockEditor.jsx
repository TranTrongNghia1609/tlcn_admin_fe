import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { githubLight } from '@uiw/codemirror-theme-github';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { X, Plus } from 'lucide-react';

const LANGUAGE_EXTENSIONS = {
  cpp: { extension: cpp, label: 'C++' },
  javascript: { extension: javascript, label: 'JavaScript' },
  python: { extension: python, label: 'Python' },
};

const CodeBlockEditor = ({ value, onChange, onClose, onInsert, language, onLanguageChange }) => {
  return (
    <div className="border-2 border-blue-500 rounded-lg p-4 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Label className="font-semibold text-gray-800">Ngôn ngữ:</Label>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium hover:border-blue-400 transition-colors"
          >
            <option value="cpp">C++</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-500 hover:text-red-600 hover:bg-red-50"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* CodeMirror Editor */}
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        <CodeMirror
          value={value}
          height="400px"
          extensions={[LANGUAGE_EXTENSIONS[language].extension()]}
          theme={githubLight}
          onChange={(val) => onChange(val)}
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
            closeBracketsKeymap: true,
            searchKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
        />
      </div>

      {/* Helper Text */}
      <div className="mt-3 flex items-start gap-2 text-xs text-gray-600 bg-blue-50 p-3 rounded-md border border-blue-100">
        <span className="text-blue-600 text-base">💡</span>
        <div className="flex-1">
          <p className="leading-relaxed">
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono shadow-sm">Tab</kbd> để thụt lề,
            <kbd className="ml-1 px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono shadow-sm">Ctrl+F</kbd> để tìm kiếm,
            <kbd className="ml-1 px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono shadow-sm">Ctrl+/</kbd> để comment
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="hover:bg-gray-100"
        >
          Hủy
        </Button>
        <Button
          type="button"
          onClick={onInsert}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Chèn vào nội dung
        </Button>
      </div>
    </div>
  );
};

export default CodeBlockEditor;