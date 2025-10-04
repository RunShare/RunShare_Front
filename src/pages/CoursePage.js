import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, courseService } from '../services/authService';
import { getCurrentLocation } from '../utils/locationUtils';
import CourseList from '../components/CourseList';
import './CoursePage.css';

function CoursePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [sortBy, setSortBy] = useState('distance');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    initLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      loadCourses();
    }
  }, [userLocation, sortBy, page]);

  const initLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
    } catch (error) {
      console.error('Failed to get location:', error);
      alert('위치 정보를 가져올 수 없습니다.');
    }
  };

  const loadCourses = async () => {
    try {
      setLoading(true);
      const userId = authService.getCurrentUserId();
      const data = await courseService.getCourses(
        userId,
        userLocation.lat,
        userLocation.lng,
        sortBy,
        page,
        10
      );
      setCourses(data.content || []);
      setTotalPages(data.totalPages || 0);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load courses:', error);
      alert('코스 목록을 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setPage(0);
  };

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className="course-page-container">
      <div className="course-header">
        <h1>추천 러닝 코스</h1>
        <div className="header-buttons">
          <button onClick={() => navigate('/mypage')} className="nav-button">
            마이페이지
          </button>
          <button onClick={() => { authService.logout(); navigate('/'); }} className="logout-button">
            로그아웃
          </button>
        </div>
      </div>

      <div className="sort-controls">
        <button
          className={sortBy === 'distance' ? 'active' : ''}
          onClick={() => handleSortChange('distance')}
        >
          거리순
        </button>
        <button
          className={sortBy === 'name' ? 'active' : ''}
          onClick={() => handleSortChange('name')}
        >
          이름순
        </button>
      </div>

      {loading ? (
        <div className="loading">로딩 중...</div>
      ) : (
        <>
          <CourseList courses={courses} onCourseClick={handleCourseClick} />
          
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0}
              >
                이전
              </button>
              <span>
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages - 1}
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CoursePage;