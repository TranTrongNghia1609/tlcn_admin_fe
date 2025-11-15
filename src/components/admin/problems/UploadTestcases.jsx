import React, { useState } from 'react';

function UploadTestcases({onHandleUpload, isUpdate, zipName}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');

  // Xử lý khi chọn file
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    
    if (file && file.type === 'application/zip') {
      setSelectedFile(file);
      setFileName(file.name);
      console.log('File đã được chọn:', file.name);
    } else {
      alert('Vui lòng chọn file ZIP');
    }
  };

  const handleSave = async () => {
    if (!selectedFile) {
      alert('Vui lòng chọn file trước');
      return;
    }
    await onHandleUpload(selectedFile);
  }
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Test Cases</h2>
        <p className="text-gray-600">Upload file ZIP cho testcase của bài tập này</p>
      </div>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
        <h3 className="font-semibold text-blue-800 mb-2">📋 Cấu trúc thư mục</h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p>Hãy chuẩn bị và đăng tải một file zip có cấu trúc như sau:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Nhiều folder, mỗi folder ứng với một testcase</li>
            <li>Tên folder có thể bất kỳ (ví dụ: test1, test2, ...)</li>
            <li>Mỗi folder yêu cầu 2 files:</li>
            <ul className="list-disc ml-5 mt-1">
              <li><code className="bg-blue-100 px-1 rounded">input.inp</code> - Input</li>
              <li><code className="bg-blue-100 px-1 rounded">output.out</code> - Output</li>
            </ul>
          </ul>
        </div>
      </div>

      {/* Upload Area */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select ZIP File
        </label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">ZIP files only</p>
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
      {selectedFile && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-green-700 font-medium">Selected file: {fileName}</span>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex justify-end">
        <button
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            selectedFile
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!selectedFile}
          onClick={handleSave}
        >
          Tạo
        </button>
      </div>
    </div>
  )
}

export default UploadTestcases