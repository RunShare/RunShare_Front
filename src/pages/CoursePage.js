import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService, authService } from '../services/authService';
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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setUserLocation({ lat: 37.5665, lng: 126.9780 });
        }
      );
    } else {
      setUserLocation({ lat: 37.5665, lng: 126.9780 });
    }
  };

  const loadCourses = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const data = await courseService.getCourses(
        userId,
        userLocation.lat,
        userLocation.lng,
        sortBy,
        page
      );
      setCourses(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      setCourses([]);
    }
    setLoading(false);
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

  const handleDeleteCourse = async (courseId) => {
    const userId = localStorage.getItem('userId');

    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      await courseService.deleteCourse(userId, courseId);
      alert('코스가 삭제되었습니다.');
      loadCourses();
    } catch (error) {
      alert('코스 삭제에 실패했습니다.');
    }
  };

  // 코스 생성 메뉴로 이동
  const handleCreateCourse = () => {
    navigate('/course/create');
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

      <div className="course-page-header">
        <button className="create-course-button" onClick={handleCreateCourse}>
          코스 생성
        </button>
      </div>

      {loading ? (
        <div className="loading">로딩 중...</div>
      ) : (
        <>
          <CourseList
            courses={courses}
            onCourseClick={handleCourseClick}
            onDeleteCourse={handleDeleteCourse}
          />
          
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