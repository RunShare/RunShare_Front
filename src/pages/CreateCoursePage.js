import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '../services/authService';
import './CreateCoursePage.css'; // CSS 적용

function CreateCoursePage() {
  // const [name, setName] = useState('');
  // const [description, setDescription] = useState('');
  // const [level, setLevel] = useState('BEGINNER');
  const [gpxFile, setGpxFile] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setGpxFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (/*!name || !description* ||*/ !gpxFile) {
      setError('모든 정보를 입력하고 GPX 파일을 업로드하세요.');
      return;
    }
    try {
      const userId = localStorage.getItem('userId');
      // const formData = new FormData();
      // formData.append('name', name);
      // formData.append('description', description);
      // formData.append('level', level);
      // formData.append('gpxFile', gpxFile);
      // formData.append('userId', userId);

      await courseService.createCourse(userId, gpxFile);
      alert('코스가 성공적으로 생성되었습니다.');
      navigate('/courses');
    } catch (err) {
      setError('코스 생성에 실패했습니다.');
    }
  };

  return (
    <div className="create-course-container">
      <h2>코스 생성</h2>
      <form className="create-course-form" onSubmit={handleSubmit}>
        {/* 
        <div>
          <label>코스 이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label>설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label>난이도</label>
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="BEGINNER">초급</option>
            <option value="INTERMEDIATE">중급</option>
            <option value="ADVANCED">고급</option>
          </select>
        </div>
        */}
        <div>
          <label>GPX 파일 업로드</label>
          <input type="file" accept=".gpx" onChange={handleFileChange} required />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit">코스 생성</button>
      </form>
    </div>
  );
}

export default CreateCoursePage;