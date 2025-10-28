import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.login(username, password);
      navigate('/mypage');
    } catch (err) {
      setError('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10.5 13.5L8 11l-1.5 1.5L10.5 16.5 18 9l-1.5-1.5z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">RunShare</h1>
          <p className="text-gray-600">당신의 러닝을 기록하세요</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              아이디
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              placeholder="아이디를 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-4 rounded-full font-bold hover:bg-gray-800 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed active:scale-95"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/register')}
            className="w-full bg-gray-100 text-gray-900 py-4 rounded-full font-bold hover:bg-gray-200 transition-all active:scale-95"
          >
            회원가입
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            함께 달려요, RunShare과 함께
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;