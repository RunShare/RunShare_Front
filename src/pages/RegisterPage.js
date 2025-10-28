import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    age: '',
    weight: '',
    height: '',
    gender: 'MALE'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await axios.post('/api/auth/register', {
        username: formData.username,
        password: formData.password,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        gender: formData.gender
      });
      
      alert('회원가입이 완료되었습니다!');
      navigate('/');
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data);
      } else {
        setError('회원가입 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">RunShare</h1>
          <p className="text-gray-600">함께 달리는 즐거움</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              아이디 <span className="text-gray-500">(4~10자)</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              minLength={4}
              maxLength={10}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              placeholder="아이디를 입력하세요"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호 <span className="text-gray-500">(4~10자)</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              minLength={4}
              maxLength={10}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          {/* Age and Gender in row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                나이
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min={1}
                max={99}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                placeholder="나이"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                성별
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              >
                <option value="MALE">남성</option>
                <option value="FEMALE">여성</option>
              </select>
            </div>
          </div>

          {/* Weight and Height in row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                체중 (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                min={1}
                max={200}
                step="0.1"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                placeholder="70"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                키 (cm)
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                min={1}
                max={300}
                step="0.1"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                placeholder="175"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-4 rounded-full font-bold hover:bg-gray-800 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed active:scale-95 mt-6"
          >
            {isLoading ? '가입 중...' : '회원가입'}
          </button>

          {/* Back to Login Button */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full bg-gray-100 text-gray-900 py-4 rounded-full font-bold hover:bg-gray-200 transition-all active:scale-95"
          >
            로그인으로 돌아가기
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            가입하시면 RunShare의 <span className="font-medium">이용약관</span>에 동의하게 됩니다
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;