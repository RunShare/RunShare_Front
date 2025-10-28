import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '../services/authService';

function CreateCoursePage() {
  const [gpxFile, setGpxFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGpxFile(file);
      setFileName(file.name);
      setError('');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.gpx')) {
        setGpxFile(file);
        setFileName(file.name);
        setError('');
      } else {
        setError('GPX 파일만 업로드 가능합니다.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gpxFile) {
      setError('GPX 파일을 업로드하세요.');
      return;
    }
    
    setIsLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      await courseService.createCourse(userId, gpxFile);
      alert('코스가 성공적으로 생성되었습니다.');
      navigate('/courses');
    } catch (err) {
      setError('코스 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/courses')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xl font-bold text-gray-900">코스 추가</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-6 max-w-2xl mx-auto pb-12">
        <section className="mt-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              새로운 코스를<br />추가하세요
            </h1>
            <p className="text-gray-600">GPX 파일을 업로드하여 러닝 코스를 공유하세요</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div>
              <label 
                className={`
                  relative flex flex-col items-center justify-center w-full h-64 
                  border-2 border-dashed rounded-3xl cursor-pointer 
                  transition-all duration-300
                  ${dragActive 
                    ? 'border-black bg-gray-50' 
                    : fileName 
                      ? 'border-black bg-black text-white' 
                      : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                  }
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".gpx"
                  onChange={handleFileChange}
                  required
                  className="hidden"
                />
                
                {fileName ? (
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                    <p className="text-xl font-bold mb-2">{fileName}</p>
                    <p className="text-sm opacity-80">클릭하여 파일 변경</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-lg font-bold text-gray-900 mb-2">
                      GPX 파일을 드래그하거나 클릭하여 업로드
                    </p>
                    <p className="text-sm text-gray-500">
                      지원 형식: .gpx
                    </p>
                  </div>
                )}
              </label>

              {/* File Info */}
              {fileName && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900">{fileName}</p>
                        <p className="text-sm text-gray-500">업로드 준비 완료</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setGpxFile(null);
                        setFileName('');
                      }}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 mb-1">GPX 파일이란?</p>
                  <p className="text-sm text-blue-700">
                    GPS 데이터를 포함한 러닝 경로 파일입니다. 대부분의 러닝 앱에서 내보내기가 가능합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/courses')}
                className="flex-1 bg-gray-100 text-gray-900 py-4 rounded-full font-bold hover:bg-gray-200 transition-all active:scale-95"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isLoading || !gpxFile}
                className="flex-1 bg-black text-white py-4 rounded-full font-bold hover:bg-gray-800 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-95"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>업로드 중...</span>
                  </div>
                ) : (
                  '코스 생성'
                )}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default CreateCoursePage;