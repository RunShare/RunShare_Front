import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '../services/authService';
import CourseMap from '../components/CourseMap';
import { parseGpxToCoordinates } from '../utils/locationUtils';

function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [gpxData, setGpxData] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    distance: 0,
    elevationGain: 0,
    duration: 0
  });

  useEffect(() => {
    loadGpxData();
  }, [courseId]);

  const loadGpxData = async () => {
    const userId = localStorage.getItem('userId');
    try {
      console.log('Fetching GPX for courseId:', courseId);
      const data = await courseService.getGpxFile(userId, courseId);
      console.log('GPX 데이터 길이:', data.length);
      console.log('GPX 처음 200자:', data.substring(0, 200));
      setGpxData(data);
      const coords = parseGpxToCoordinates(data);
      console.log('파싱된 좌표 개수:', coords.length);
      console.log('첫 3개 좌표:', coords.slice(0, 3));
      
      if (coords.length === 0) {
        alert('GPX 파일에서 좌표를 찾을 수 없습니다.');
      } else {
        // Calculate stats
        const distance = calculateDistance(coords);
        setStats({
          distance: distance,
          elevationGain: 0, // TODO: Calculate from elevation data
          duration: 0 // TODO: Calculate from time data
        });
      }
      
      setCoordinates(coords);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load GPX data:', error);
      alert('코스 데이터를 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  // Calculate total distance from coordinates
  const calculateDistance = (coords) => {
    if (coords.length < 2) return 0;
    
    let total = 0;
    for (let i = 1; i < coords.length; i++) {
      const R = 6371; // Earth's radius in km
      const dLat = toRad(coords[i].lat - coords[i-1].lat);
      const dLng = toRad(coords[i].lng - coords[i-1].lng);
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(coords[i-1].lat)) * Math.cos(toRad(coords[i].lat)) *
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      total += R * c;
    }
    return total;
  };

  const toRad = (deg) => deg * (Math.PI / 180);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">코스를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/courses')}
            className="flex items-center space-x-2 text-gray-900 hover:text-black transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">목록으로</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900">코스 상세</h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {/* Map Section */}
        <section className="w-full" style={{ height: '60vh' }}>
          <CourseMap coordinates={coordinates} />
        </section>

        {/* Stats Section */}
        <section className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Distance Card */}
            <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-1">총 거리</p>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-bold text-gray-900">{stats.distance.toFixed(2)}</span>
                <span className="text-lg text-gray-500">km</span>
              </div>
            </div>

            {/* Waypoints Card */}
            <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-1">경로 포인트</p>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-bold text-gray-900">{coordinates.length}</span>
                <span className="text-lg text-gray-500">개</span>
              </div>
            </div>

            {/* Course ID Card */}
            <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-1">코스 ID</p>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-gray-900 truncate">#{courseId}</span>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-gradient-to-br from-gray-800 to-black rounded-3xl p-8 text-white">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">코스 정보</h3>
                <p className="text-white/80 leading-relaxed">
                  이 코스는 {coordinates.length}개의 GPS 포인트로 구성되어 있으며, 
                  총 {stats.distance.toFixed(2)}km의 거리입니다. 
                  지도에서 경로를 확인하고 나만의 러닝을 계획해보세요.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => navigate('/courses')}
              className="flex-1 bg-gray-100 text-gray-900 py-4 rounded-full font-bold hover:bg-gray-200 transition-all active:scale-95"
            >
              코스 목록으로
            </button>
            <button
              onClick={() => {
                // TODO: Start running with this course
                alert('러닝 시작 기능은 준비 중입니다!');
              }}
              className="flex-1 bg-black text-white py-4 rounded-full font-bold hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span>이 코스로 러닝하기</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default CourseDetailPage;