import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, userService } from '../services/authService';
import './MyPage.css';

function MyPage() {
  const [profile, setProfile] = useState({
    level: 'BEGINNER',
    age: '',
    weight: '',
    height: '',
    gender: 'MALE'  // ✅ 추가
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
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

  // 레벨 한글 변환 함수 추가
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

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="mypage-container">
      <div className="mypage-header">
        <h1>마이 페이지</h1>
        <div className="header-buttons">
          <button onClick={() => navigate('/courses')} className="nav-button">
            코스 보기
          </button>
          <button onClick={handleLogout} className="logout-button">
            로그아웃
          </button>
        </div>
      </div>

      <div className="profile-card">
        {/* ✅ 레벨 필드 수정 (수정 불가 + 측정 버튼) */}
        <div className="profile-field">
          <label>러닝 레벨</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ flex: 1 }}>{getLevelText(profile.level)}</span>
            <button 
              onClick={() => navigate('/cooper-test')} 
              className="cooper-button"
              style={{
                padding: '8px 16px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              측정하기
            </button>
          </div>
        </div>

        <div className="profile-field">
          <label>나이</label>
          {isEditing ? (
            <input
              type="number"
              value={profile.age || ''}
              onChange={(e) => handleChange('age', parseInt(e.target.value))}
              placeholder="나이를 입력하세요"
            />
          ) : (
            <span>{profile.age || '미입력'}</span>
          )}
        </div>

        <div className="profile-field">
          <label>체중 (kg)</label>
          {isEditing ? (
            <input
              type="number"
              step="0.1"
              value={profile.weight || ''}
              onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
              placeholder="체중을 입력하세요"
            />
          ) : (
            <span>{profile.weight ? `${profile.weight} kg` : '미입력'}</span>
          )}
        </div>

        <div className="profile-field">
          <label>키 (cm)</label>
          {isEditing ? (
            <input
              type="number"
              step="0.1"
              value={profile.height || ''}
              onChange={(e) => handleChange('height', parseFloat(e.target.value))}
              placeholder="키를 입력하세요"
            />
          ) : (
            <span>{profile.height ? `${profile.height} cm` : '미입력'}</span>
          )}
        </div>

        {/*성별 필드 */}
        <div className="profile-field">
          <label>성별</label>
          {isEditing ? (
            <select
              value={profile.gender || 'MALE'}
              onChange={(e) => handleChange('gender', e.target.value)}
            >
              <option value="MALE">남성</option>
              <option value="FEMALE">여성</option>
            </select>
          ) : (
            <span>{profile.gender === 'MALE' ? '남성' : '여성'}</span>
          )}
        </div>

        <div className="button-group">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="save-button">
                저장
              </button>
              <button onClick={() => setIsEditing(false)} className="cancel-button">
                취소
              </button>
            </>
          ) : (
            <button onClick={handleEdit} className="edit-button">
              수정
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyPage;