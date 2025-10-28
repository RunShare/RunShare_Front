import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, userService } from '../services/authService';

function MyPage() {
  const [profile, setProfile] = useState({
    level: 'BEGINNER',
    age: '',
    weight: '',
    height: '',
    gender: 'MALE'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userId = authService.getCurrentUserId();
      const data = await userService.getProfile(userId);
      if (data) {
        setProfile(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const userId = authService.getCurrentUserId();
      await userService.updateProfile(userId, profile);
      setIsEditing(false);
      alert('프로필이 저장되었습니다.');
    } catch (error) {
      alert('프로필 저장에 실패했습니다.');
    }
  };

  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const getLevelText = (level) => {
    switch(level) {
      case 'ADVANCED': return '상급';
      case 'UPPER_INTERMEDIATE': return '중상급';
      case 'INTERMEDIATE': return '중급';
      case 'LOWER_INTERMEDIATE': return '중하급';
      case 'BEGINNER': return '초급';
      default: return '초급';
    }
  };

  const getLevelColor = (level) => {
    switch(level) {
      case 'ADVANCED': return 'from-purple-600 to-purple-800';
      case 'UPPER_INTERMEDIATE': return 'from-blue-600 to-blue-800';
      case 'INTERMEDIATE': return 'from-green-600 to-green-800';
      case 'LOWER_INTERMEDIATE': return 'from-yellow-600 to-yellow-800';
      case 'BEGINNER': return 'from-gray-600 to-gray-800';
      default: return 'from-gray-600 to-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">마이 페이지</span>
          </div>
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Slide Menu */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-out ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="pt-24 px-6">
          <nav className="space-y-2">
            <button
              onClick={() => navigate('/mypage')}
              className="w-full flex items-center space-x-4 px-4 py-3 rounded-xl bg-gray-50 text-black font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <span>프로필</span>
            </button>
            
            <button
              onClick={() => navigate('/courses')}
              className="w-full flex items-center space-x-4 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span>코스 보기</span>
            </button>

            <button
              onClick={() => navigate('/cooper-test')}
              className="w-full flex items-center space-x-4 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>체력 측정</span>
            </button>
          </nav>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-4 px-4 py-3 mt-8 rounded-xl hover:bg-red-50 transition-colors group"
          >
            <svg className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-gray-700 group-hover:text-red-600 font-medium transition-colors">로그아웃</span>
          </button>
        </div>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="pt-20 px-6 max-w-4xl mx-auto pb-12">
        {/* Level Card */}
        <section className="mt-8 mb-8">
          <div className={`bg-gradient-to-r ${getLevelColor(profile.level)} rounded-3xl p-8 text-white relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative z-10">
              <p className="text-sm opacity-90 mb-2">현재 레벨</p>
              <h2 className="text-4xl font-bold mb-4">{getLevelText(profile.level)}</h2>
              <button
                onClick={() => navigate('/cooper-test')}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full font-bold hover:bg-white/30 transition-all active:scale-95"
              >
                레벨 측정하기
              </button>
            </div>
          </div>
        </section>

        {/* Profile Info */}
        <section className="bg-gray-50 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">프로필 정보</h3>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="px-6 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all"
              >
                수정
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">나이</label>
              {isEditing ? (
                <input
                  type="number"
                  value={profile.age || ''}
                  onChange={(e) => handleChange('age', parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="나이를 입력하세요"
                />
              ) : (
                <p className="text-lg text-gray-900">{profile.age || '미입력'}</p>
              )}
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">체중</label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.1"
                  value={profile.weight || ''}
                  onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="체중을 입력하세요"
                />
              ) : (
                <p className="text-lg text-gray-900">{profile.weight ? `${profile.weight} kg` : '미입력'}</p>
              )}
            </div>

            {/* Height */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">키</label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.1"
                  value={profile.height || ''}
                  onChange={(e) => handleChange('height', parseFloat(e.target.value))}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="키를 입력하세요"
                />
              ) : (
                <p className="text-lg text-gray-900">{profile.height ? `${profile.height} cm` : '미입력'}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">성별</label>
              {isEditing ? (
                <select
                  value={profile.gender || 'MALE'}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="MALE">남성</option>
                  <option value="FEMALE">여성</option>
                </select>
              ) : (
                <p className="text-lg text-gray-900">{profile.gender === 'MALE' ? '남성' : '여성'}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSave}
                className="flex-1 bg-black text-white py-4 rounded-full font-bold hover:bg-gray-800 transition-all active:scale-95"
              >
                저장
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-200 text-gray-900 py-4 rounded-full font-bold hover:bg-gray-300 transition-all active:scale-95"
              >
                취소
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default MyPage;