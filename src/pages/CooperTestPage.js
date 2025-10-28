import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, Polyline, Marker, useJsApiLoader } from '@react-google-maps/api';
import axios from 'axios';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 37.5665,
  lng: 126.9780
};

function CooperTestPage() {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(true);
  const [testState, setTestState] = useState('ready'); // ready, countdown, running, finished
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(720); // 12분 = 720초
  const [distance, setDistance] = useState(0);
  const [path, setPath] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [heading, setHeading] = useState(0);
  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  });

  // 거리 계산 함수 (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // 지구 반지름 (미터)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // 미터 단위
  };

  // 방향 계산 함수 (Bearing)
  const calculateBearing = (lat1, lon1, lat2, lon2) => {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360; // 0-360도로 정규화
  };

  // 테스트 시작
  const startTest = () => {
    setShowInfo(false);
    setTestState('countdown');
    
    let count = 3;
    const countInterval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(countInterval);
        startRunning();
      }
    }, 1000);
  };

  // 달리기 시작
  const startRunning = () => {
    setTestState('running');
    
    // 위치 추적 시작
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setCurrentPosition(newPos);
          
          setPath(prevPath => {
            if (prevPath.length > 0) {
              const lastPos = prevPath[prevPath.length - 1];
              
              // 거리 계산
              const dist = calculateDistance(
                lastPos.lat, lastPos.lng,
                newPos.lat, newPos.lng
              );
              setDistance(prev => Math.round(prev + dist));
              
              // 방향 계산
              const bearing = calculateBearing(
                lastPos.lat, lastPos.lng,
                newPos.lat, newPos.lng
              );
              setHeading(bearing);
            }
            return [...prevPath, newPos];
          });
        },
        (error) => {
          console.error('위치 추적 오류:', error);
          alert('위치 추적에 실패했습니다. GPS를 활성화해주세요.');
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      );
    }
    
    // 타이머 시작
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 테스트 종료
  const finishTest = () => {
    setTestState('finished');
    
    // 위치 추적 중지
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    
    // 타이머 중지
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const saveResult = async () => {
    try {
      const userId = localStorage.getItem('userId');
      
      // 프로필 정보 가져와서 사용
      const profileResponse = await axios.get(`/api/user/${userId}`);
      const profile = profileResponse.data;
      
      const response = await axios.post(`/api/user/${userId}/cooper-test`, {
        userId: parseInt(userId),
        distance: distance,
        age: profile.age,
        gender: profile.gender
      });
      
      alert(`테스트 완료!\n레벨: ${response.data.level}\n${response.data.message}`);
      navigate('/mypage');
    } catch (error) {
      console.error('결과 저장 실패:', error);
      alert('결과 저장에 실패했습니다.');
    }
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 시간 포맷 (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">지도를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">쿠퍼 테스트</h2>
              <p className="text-gray-600">12분간의 러닝으로 체력 측정</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">준비</h4>
                    <p className="text-sm text-gray-600">평탄한 트랙이나 도로에서 준비하세요</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">측정</h4>
                    <p className="text-sm text-gray-600">12분 동안 최대한 멀리 달리세요</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">결과</h4>
                    <p className="text-sm text-gray-600">VO2max와 러닝 레벨을 확인하세요</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={startTest}
              className="w-full bg-black text-white py-4 rounded-full font-bold hover:bg-gray-800 transition-all active:scale-95"
            >
              테스트 시작
            </button>
          </div>
        </div>
      )}

      {/* Countdown */}
      {testState === 'countdown' && (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-40">
          <div className="text-center">
            <div className="text-[200px] font-bold text-black mb-4 animate-pulse">
              {countdown === 0 ? 'GO!' : countdown}
            </div>
            <p className="text-xl text-gray-600">준비하세요...</p>
          </div>
        </div>
      )}

      {/* Running/Finished State */}
      {(testState === 'running' || testState === 'finished') && (
        <div className="h-screen flex flex-col">
          {/* Header with Stats */}
          <div className="relative z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => {
                    if (window.confirm('테스트를 종료하시겠습니까?')) {
                      finishTest();
                      navigate('/mypage');
                    }
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="text-lg font-bold text-gray-900">쿠퍼 테스트</h2>
                <div className="w-10"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Timer */}
                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">남은 시간</p>
                  <p className={`text-4xl font-bold ${testState === 'finished' ? 'text-red-600' : 'text-black'}`}>
                    {formatTime(timeLeft)}
                  </p>
                </div>

                {/* Distance */}
                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">달린 거리</p>
                  <p className="text-4xl font-bold text-green-600">
                    {distance}m
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 relative">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={currentPosition || center}
              zoom={16}
              options={{
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                disableDefaultUI: false
              }}
            >
              {/* Path */}
              {path.length > 0 && (
                <Polyline
                  path={path}
                  options={{
                    strokeColor: '#000000',
                    strokeOpacity: 1.0,
                    strokeWeight: 5
                  }}
                />
              )}
              
              {/* Current Position Marker */}
              {currentPosition && (
                <Marker
                  position={currentPosition}
                  icon={{
                    path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale: 7,
                    fillColor: '#000000',
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 2,
                    rotation: heading
                  }}
                  zIndex={1000}
                />
              )}
            </GoogleMap>

            {/* Finished Overlay */}
            {testState === 'finished' && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-6 z-20">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">완료!</h2>
                  <p className="text-gray-600 mb-8">12분 동안 {distance}m를 달렸습니다</p>

                  <div className="space-y-3">
                    <button
                      onClick={saveResult}
                      className="w-full bg-black text-white py-4 rounded-full font-bold hover:bg-gray-800 transition-all active:scale-95"
                    >
                      결과 저장하고 레벨 확인
                    </button>
                    <button
                      onClick={() => navigate('/mypage')}
                      className="w-full bg-gray-100 text-gray-900 py-4 rounded-full font-bold hover:bg-gray-200 transition-all active:scale-95"
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CooperTestPage;