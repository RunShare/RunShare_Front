import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService, authService } from '../services/authService';
import CourseList from '../components/CourseList';

function CoursePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [sortBy, setSortBy] = useState('distance');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
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

  const handleCreateCourse = () => {
    navigate('/course/create');
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">코스 탐색</span>
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
              className="w-full flex items-center space-x-4 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <span>프로필</span>
            </button>
            
            <button
              onClick={() => navigate('/courses')}
              className="w-full flex items-center space-x-4 px-4 py-3 rounded-xl bg-gray-50 text-black font-medium"
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
      <main className="pt-20 px-6 max-w-6xl mx-auto pb-12">
        {/* Hero Section */}
        <section className="mt-8 mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            추천 러닝 코스
          </h1>
          <p className="text-lg text-gray-600">당신 근처의 최고의 러닝 코스를 발견하세요</p>
        </section>

        {/* Sort Controls */}
        <section className="mb-6 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => handleSortChange('distance')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                sortBy === 'distance'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              거리순
            </button>
            <button
              onClick={() => handleSortChange('name')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                sortBy === 'name'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              이름순
            </button>
          </div>

          <button
            onClick={handleCreateCourse}
            className="flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-all active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>코스 생성</span>
          </button>
        </section>

        {/* Course List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">코스를 불러오는 중...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">등록된 코스가 없습니다</h3>
            <p className="text-gray-600 mb-6">첫 번째 코스를 만들어보세요!</p>
            <button
              onClick={handleCreateCourse}
              className="inline-flex items-center space-x-2 bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition-all active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>코스 생성하기</span>
            </button>
          </div>
        ) : (
          <>
            <CourseList
              courses={courses}
              onCourseClick={handleCourseClick}
              onDeleteCourse={handleDeleteCourse}
            />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 0}
                  className="px-6 py-3 bg-gray-100 text-gray-900 rounded-full font-medium hover:bg-gray-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
                >
                  이전
                </button>
                <span className="text-gray-600 font-medium">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="px-6 py-3 bg-gray-100 text-gray-900 rounded-full font-medium hover:bg-gray-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default CoursePage;