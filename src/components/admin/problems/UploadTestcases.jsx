import React, { useEffect, useState } from 'react';

function UploadTestcases({onHandleUpload, isUpdate, zipName}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState(null);
  useEffect(() => {
    setFileName(zipName || null);
  }, [zipName]);
  // Xử lý khi chọn file
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      console.log('File đã được chọn:', file.name);
    } else {
      alert('Vui lòng chọn file ZIP');
    }
  };

  const handleSave = async () => {
    if (!selectedFile && !isUpdate) {
      alert('Vui lòng chọn file trước');
      return;
    }
    await onHandleUpload(selectedFile);
  }
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl shadow-xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Tải lên Test Cases</h2>
        <p className="text-gray-600 dark:text-slate-400">Tải lên file ZIP chứa testcases cho bài tập này</p>
      </div>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-blue-50/50 dark:bg-blue-950/20 border-l-4 border-blue-400 dark:border-blue-500 rounded-r-xl">
        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">📋 Cấu trúc thư mục</h3>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
          <p>Hãy chuẩn bị và đăng tải một file zip có cấu trúc như sau:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Nhiều folder, mỗi folder ứng với một testcase</li>
            <li>Tên folder có thể bất kỳ (ví dụ: test1, test2, ...)</li>
            <li>Mỗi folder yêu cầu 2 files:</li>
            <ul className="list-disc ml-5 mt-1">
              <li><code className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded font-mono text-xs">input.inp</code> - Input</li>
              <li><code className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded font-mono text-xs">output.out</code> - Output</li>
            </ul>
          </ul>
        </div>
      </div>

      {/* Upload Area */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
          Chọn File ZIP
        </label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-gray-300 dark:border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-3 text-gray-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mb-1 text-sm text-gray-500 dark:text-slate-400">
                <span className="font-semibold text-blue-600 dark:text-blue-400">Nhấn để tải lên</span> hoặc kéo thả file vào đây
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-500">Chấp nhận định dạng .ZIP</p>
            </div>
            <input
              type="file"
              accept=".zip"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Selected File Display */}
      {fileName && (
        <div className="mb-6 p-4 bg-green-50/50 dark:bg-green-950/15 border border-green-200 dark:border-green-800/30 rounded-xl">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 dark:text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-green-700 dark:text-green-400 font-bold">File đã chọn: {fileName}</span>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex justify-end">
        <button
          className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-200 ${
            selectedFile || isUpdate
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md active:scale-[0.98]'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
          }`}
          disabled={!selectedFile && !isUpdate}
          onClick={handleSave}
        >
          {isUpdate ? 'Cập nhật' : 'Tạo bài tập'}
        </button>
      </div>
    </div>
  );
}

export default UploadTestcases