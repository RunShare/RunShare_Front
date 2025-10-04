import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '../services/authService';
import CourseMap from '../components/CourseMap';
import { parseGpxToCoordinates } from '../utils/locationUtils';
import './CourseDetailPage.css';

function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [gpxData, setGpxData] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGpxData();
  }, [courseId]);

  const loadGpxData = async () => {
    try {
      console.log('Fetching GPX for courseId:', courseId);
      const data = await courseService.getGpxFile(courseId);    
      console.log('GPX 데이터 길이:', data.length);
      console.log('GPX 처음 200자:', data.substring(0, 200));
      setGpxData(data);
      const coords = parseGpxToCoordinates(data);
      console.log('파싱된 좌표 개수:', coords.length);
      console.log('첫 3개 좌표:', coords.slice(0, 3));
      if (coords.length === 0) {
      alert('GPX 파일에서 좌표를 찾을 수 없습니다.');
    }
      setCoordinates(coords);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load GPX data:', error);
      alert('코스 데이터를 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="course-detail-container">
      <div className="course-detail-header">
        <button onClick={() => navigate('/courses')} className="back-button">
          ← 목록으로
        </button>
        <h1>코스 상세</h1>
      </div>

      <div className="map-container">
        <CourseMap coordinates={coordinates} />
      </div>
    </div>
  );
}

export default CourseDetailPage;