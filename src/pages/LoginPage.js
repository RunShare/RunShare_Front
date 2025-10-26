import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await authService.login(username, password);
      navigate('/mypage');
    } catch (err) {
      setError('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>러닝 프로젝트</h1>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="text"
              placeholder="아이디"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-button">
            로그인
          </button>
          <button
            type="button"
            onClick={() => navigate('/register')}
            style={{
              width: '100%',
              padding: '12px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;