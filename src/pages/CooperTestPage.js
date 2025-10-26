import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, Polyline, Marker, useJsApiLoader } from '@react-google-maps/api';
import axios from 'axios';

const mapContainerStyle = {
  width: '100%',
  height: '400px'
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
  const [heading, setHeading] = useState(0); // ✅ 추가: 이동 방향
  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
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

  // ✅ 추가: 방향 계산 함수 (Bearing)
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
          
          // ✅ 수정: 거리 계산 및 방향 계산
          setPath(prevPath => {
            if (prevPath.length > 0) {
              const lastPos = prevPath[prevPath.length - 1];
              
              // 거리 계산
              const dist = calculateDistance(
                lastPos.lat, lastPos.lng,
                newPos.lat, newPos.lng
              );
              setDistance(prev => Math.round(prev + dist));
              
              // ✅ 방향 계산
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
      
      //프로필 정보 가져와서 사용
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

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* 안내 모달 */}
      {showInfo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '10px',
            maxWidth: '600px',
            textAlign: 'center'
          }}>
            <h2 style={{ marginBottom: '20px' }}>쿠퍼 테스트란?</h2>
            <p style={{ lineHeight: '1.8', marginBottom: '20px', textAlign: 'left' }}>
              별도의 측정장비 없이 <strong>12분간의 달리기</strong>만으로 
              <strong> VO2max(최대산소섭취량)</strong>을 측정해 운동능력을 평가하는 테스트입니다.
              <br/><br/>
              <strong>준비물:</strong> 평탄한 트랙<br/>
              <strong>목표:</strong> 12분간 달릴 수 있는 최대 거리 측정
            </p>
            <button
              onClick={startTest}
              style={{
                padding: '15px 40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              시작하기
            </button>
          </div>
        </div>
      )}

      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>쿠퍼 테스트</h2>

      {/* 카운트다운 */}
      {testState === 'countdown' && (
        <div style={{
          fontSize: '120px',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#667eea',
          marginTop: '100px'
        }}>
          {countdown === 0 ? 'GO!' : countdown}
        </div>
      )}

      {/* 달리기 중 */}
      {(testState === 'running' || testState === 'finished') && (
        <>
          {/* 타이머 & 거리 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            marginBottom: '20px',
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '10px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#666' }}>남은 시간</div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: testState === 'finished' ? '#dc3545' : '#667eea' }}>
                {formatTime(timeLeft)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#666' }}>달린 거리</div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#28a745' }}>
                {distance}m
              </div>
            </div>
          </div>

          {/* ✅ 지도 (Polyline + Marker 추가) */}
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={currentPosition || center}
            zoom={15}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false
            }}
          >
            {/* 달린 경로 (빨간 선) */}
            {path.length > 0 && (
              <Polyline
                path={path}
                options={{
                  strokeColor: '#FF0000',
                  strokeOpacity: 1.0,
                  strokeWeight: 4
                }}
              />
            )}
            
            {/* ✅ 현재 위치 마커 (방향 표시 화살표) */}
            {currentPosition && (
              <Marker
                position={currentPosition}
                icon={{
                  path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                  scale: 6,
                  fillColor: '#4285F4',
                  fillOpacity: 1,
                  strokeColor: '#FFFFFF',
                  strokeWeight: 2,
                  rotation: heading  // 이동 방향에 따라 회전
                }}
                zIndex={1000}
              />
            )}
          </GoogleMap>

          {/* 완료 후 버튼 */}
          {testState === 'finished' && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={saveResult}
                style={{
                  padding: '15px 40px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                결과 저장
              </button>
              <button
                onClick={() => navigate('/mypage')}
                style={{
                  padding: '15px 40px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '18px',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CooperTestPage;