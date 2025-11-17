import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '../services/authService';

function CreateCoursePage() {
  const [mode, setMode] = useState('upload'); // 'upload' or 'draw'
  const [gpxFile, setGpxFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // Drawing mode states
  const [currentPath, setCurrentPath] = useState([]);
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [difficulty, setDifficulty] = useState(3);
  const [isPublic, setIsPublic] = useState(true);
  const [isDrawMode, setIsDrawMode] = useState(true);
  const [stats, setStats] = useState({
    distance: 0,
    points: 0,
    estimatedTime: 0,
    calories: 0,
    minElevation: null,
    maxElevation: null,
    elevationGain: 0
  });
  
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const currentPathRef = useRef([]);
  const polylineRef = useRef(null);
  const markersRef = useRef([]);
  const elevationServiceRef = useRef(null);

  // Initialize Google Map
  useEffect(() => {
    // 이미 google.maps가 있으면 그냥 initMap만
    if (window.google && window.google.maps) {
      if (!mapInstanceRef.current) initMap();
      return;
    }

    // 아직 스크립트가 없다면 한 번만 추가
    if (!document.querySelector('script[data-google-maps="true"]')) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAc1Qmk8GSBe4LmKnJ54D0-U3cjTIoz4iw&libraries=geometry,elevation`;
      script.async = true;
      script.defer = true;
      script.dataset.googleMaps = 'true';

      window.initMap = initMap; // 콜백을 전역에 연결
      document.head.appendChild(script);
    }

    currentPathRef.current = currentPath;
  }, [mode]);

  const initMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      zoom: 15,
      center: { lat: 37.5665, lng: 126.9780 },
      mapTypeId: 'roadmap'
    });

    elevationServiceRef.current = new window.google.maps.ElevationService();

    mapInstanceRef.current.addListener('click', handleMapClick);
  };

  const getElevation = async (lat, lng) => {
    return new Promise((resolve) => {
      if (!elevationServiceRef.current) {
        resolve(null);
        return;
      }

      const timeout = setTimeout(() => resolve(null), 5000);

      elevationServiceRef.current.getElevationForLocations({
        locations: [{ lat, lng }],
        unitSystem: window.google.maps.UnitSystem.METRIC
      }, (results, status) => {
        clearTimeout(timeout);
        if (status === 'OK' && results && results.length > 0) {
          resolve(results[0].elevation);
        } else {
          resolve(null);
        }
      });
    });
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const handleMapClick = async (event) => {
    if (!isDrawMode || !mapInstanceRef.current) return;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    const point = { lat, lng, elevation: null };

    const prevPath = currentPathRef.current;
    const newPath = [...prevPath, point];
    const pointIndex = newPath.length;
    
    // state + ref 둘 다 업데이트
    currentPathRef.current = newPath;
    setCurrentPath(newPath);

    // Add marker - 맵이 존재하는지 다시 확인
    const currentMap = mapInstanceRef.current;
    if (!currentMap) {
      console.error('Map instance is not available');
      return;
    }
    
    try {
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: currentMap,
        title: `점 ${pointIndex} (고도 정보 로딩 중...)`,
        label: pointIndex.toString(),
        animation: window.google.maps.Animation.DROP
      });

      markersRef.current.push(marker);
      updatePolyline(newPath);
      updateStats(newPath);

      // Get elevation asynchronously
      const elevation = await getElevation(lat, lng);
      
      // 비동기 작업 후 맵이 여전히 존재하는지 확인
      if (!mapInstanceRef.current || !marker.getMap()) return;
      
      point.elevation = elevation;
      
      if (elevation !== null) {
        marker.setTitle(`점 ${pointIndex} (고도: ${elevation.toFixed(1)}m)`);
        
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <strong>점 ${pointIndex}</strong><br>
              위도: ${lat.toFixed(6)}<br>
              경도: ${lng.toFixed(6)}<br>
              고도: ${elevation.toFixed(1)}m
            </div>
          `
        });
        
        marker.addListener('click', () => {
          // 클릭 시에도 맵이 존재하는지 확인
          if (mapInstanceRef.current) {
            infoWindow.open(mapInstanceRef.current, marker);
          }
        });
      }
      
      updateStats(newPath);
    } catch (error) {
      console.error('마커 생성 또는 고도 정보를 가져오는 중 오류:', error);
    }
  };

  const updatePolyline = (path) => {
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    if (path.length > 1) {
      polylineRef.current = new window.google.maps.Polyline({
        path: path.map(p => ({ lat: p.lat, lng: p.lng })),
        geodesic: true,
        strokeColor: '#000000',
        strokeOpacity: 1.0,
        strokeWeight: 4,
      });
      polylineRef.current.setMap(mapInstanceRef.current);
    }
  };

  const updateStats = (path) => {
    if (path.length === 0) {
      setStats({
        distance: 0,
        points: 0,
        estimatedTime: 0,
        calories: 0,
        minElevation: null,
        maxElevation: null,
        elevationGain: 0
      });
      return;
    }

    let distance = 0;
    let elevationGain = 0;
    let minElevation = Infinity;
    let maxElevation = -Infinity;

    for (let i = 0; i < path.length; i++) {
      if (i > 0) {
        distance += calculateDistance(
          path[i - 1].lat, path[i - 1].lng,
          path[i].lat, path[i].lng
        );
      }

      if (path[i].elevation !== null) {
        const elevation = path[i].elevation;
        minElevation = Math.min(minElevation, elevation);
        maxElevation = Math.max(maxElevation, elevation);

        if (i > 0 && path[i - 1].elevation !== null) {
          const elevationDiff = elevation - path[i - 1].elevation;
          if (elevationDiff > 0) {
            elevationGain += elevationDiff;
          }
        }
      }
    }

    const pace = 6;
    const estimatedTime = Math.round(distance / 1000 * pace);
    const estimatedCalories = Math.round(distance / 1000 * 65);

    setStats({
      distance,
      points: path.length,
      estimatedTime,
      calories: estimatedCalories,
      minElevation: minElevation !== Infinity ? minElevation : null,
      maxElevation: maxElevation !== -Infinity ? maxElevation : null,
      elevationGain
    });
  };

  const clearPath = () => {
    setCurrentPath([]);
    
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
    
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    updateStats([]);
  };

  const undoLastPoint = () => {
    if (currentPath.length === 0) return;

    const newPath = currentPath.slice(0, -1);
    setCurrentPath(newPath);

    const lastMarker = markersRef.current.pop();
    if (lastMarker) {
      lastMarker.setMap(null);
    }

    updatePolyline(newPath);
    updateStats(newPath);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        mapInstanceRef.current.setCenter(pos);
        mapInstanceRef.current.setZoom(16);

        new window.google.maps.Marker({
          position: pos,
          map: mapInstanceRef.current,
          title: '현재 위치',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4285f4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          }
        });
      });
    } else {
      alert('GPS를 지원하지 않는 브라우저입니다.');
    }
  };

  const generateGPXContent = () => {
    const now = new Date();
    let gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="RunningApp" xmlns="http://www.topografix.com/GPX/1/1">
    <metadata>
        <name>${courseName || '새 코스'}</name>
        <desc>${courseDescription || ''}</desc>
        <time>${now.toISOString()}</time>
    </metadata>
    <trk>
        <name>${courseName || '새 코스'}</name>
        <desc>${courseDescription || ''}</desc>
        <trkseg>`;

    currentPath.forEach((point, index) => {
      const time = new Date(now.getTime() + index * 30000);
      gpxContent += `
            <trkpt lat="${point.lat}" lon="${point.lng}">`;
      
      if (point.elevation !== null) {
        gpxContent += `
                <ele>${point.elevation.toFixed(1)}</ele>`;
      }
      
      gpxContent += `
                <time>${time.toISOString()}</time>
            </trkpt>`;
    });

    gpxContent += `
        </trkseg>
    </trk>
</gpx>`;

    return gpxContent;
  };

  const downloadGPX = () => {
    if (!courseName.trim()) {
      setError('코스 이름을 입력해주세요.');
      return;
    }

    if (currentPath.length < 2) {
      setError('최소 2개 이상의 점이 필요합니다.');
      return;
    }

    const gpxContent = generateGPXContent();
    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${courseName.replace(/[^a-z0-9가-힣\s]/gi, '_')}.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`${courseName}.gpx 파일이 다운로드되었습니다!`);
  };

  // File upload handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGpxFile(file);
      setFileName(file.name);
      setError('');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.gpx')) {
        setGpxFile(file);
        setFileName(file.name);
        setError('');
      } else {
        setError('GPX 파일만 업로드 가능합니다.');
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!gpxFile) {
      setError('GPX 파일을 업로드하세요.');
      return;
    }
    
    setIsLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      await courseService.createCourse(userId, gpxFile);
      alert('코스가 성공적으로 업로드되었습니다.');
      navigate('/courses');
    } catch (err) {
      setError('코스 업로드에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/courses')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xl font-bold text-gray-900">코스 추가</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-6 max-w-6xl mx-auto pb-12">
        {/* Mode Toggle */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setMode('upload')}
              className={`px-8 py-3 rounded-full font-bold transition-all ${
                mode === 'upload' 
                  ? 'bg-black text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📁 파일 업로드
            </button>
            <button
              onClick={() => setMode('draw')}
              className={`px-8 py-3 rounded-full font-bold transition-all ${
                mode === 'draw' 
                  ? 'bg-black text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🗺️ 지도에서 그리기
            </button>
          </div>
        </div>

        {/* Upload Mode */}
        {mode === 'upload' && (
          <section className="mt-8 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                GPX 파일 업로드
              </h1>
              <p className="text-gray-600">러닝 앱에서 내보낸 GPX 파일을 공유하세요</p>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-6">
              <div>
                <label 
                  className={`
                    relative flex flex-col items-center justify-center w-full h-64 
                    border-2 border-dashed rounded-3xl cursor-pointer 
                    transition-all duration-300
                    ${dragActive 
                      ? 'border-black bg-gray-50' 
                      : fileName 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                    }
                  `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".gpx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {fileName ? (
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                      </svg>
                      <p className="text-xl font-bold mb-2">{fileName}</p>
                      <p className="text-sm opacity-80">클릭하여 파일 변경</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-lg font-bold text-gray-900 mb-2">
                        GPX 파일을 드래그하거나 클릭하여 업로드
                      </p>
                      <p className="text-sm text-gray-500">지원 형식: .gpx</p>
                    </div>
                  )}
                </label>

                {fileName && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                        </svg>
                        <div>
                          <p className="font-medium text-gray-900">{fileName}</p>
                          <p className="text-sm text-gray-500">업로드 준비 완료</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setGpxFile(null);
                          setFileName('');
                        }}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/courses')}
                  className="flex-1 bg-gray-100 text-gray-900 py-4 rounded-full font-bold hover:bg-gray-200 transition-all active:scale-95"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !gpxFile}
                  className="flex-1 bg-black text-white py-4 rounded-full font-bold hover:bg-gray-800 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-95"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>업로드 중...</span>
                    </div>
                  ) : (
                    '코스 생성'
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Draw Mode */}
        {mode === 'draw' && (
          <section className="mt-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                지도에서 직접 그리기
              </h1>
              <p className="text-gray-600">지도를 클릭하여 러닝 경로를 만들어보세요</p>
            </div>

            {/* Course Info Form */}
            <div className="bg-gray-50 rounded-3xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    코스 이름 *
                  </label>
                  <input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="한강공원 러닝코스"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    난이도
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="1">쉬움</option>
                    <option value="2">보통</option>
                    <option value="3">중간</option>
                    <option value="4">어려움</option>
                    <option value="5">매우 어려움</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    설명 (선택)
                  </label>
                  <textarea
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    placeholder="코스에 대한 설명을 입력하세요"
                    rows="2"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Map Controls */}
            <div className="bg-gray-50 rounded-3xl p-4 mb-4">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setIsDrawMode(true)}
                  className={`px-6 py-3 rounded-full font-bold transition-all ${
                    isDrawMode 
                      ? 'bg-black text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  ✏️ 그리기 모드
                </button>
                <button
                  onClick={() => setIsDrawMode(false)}
                  className={`px-6 py-3 rounded-full font-bold transition-all ${
                    !isDrawMode 
                      ? 'bg-black text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  👁️ 보기 모드
                </button>
                <button
                  onClick={getCurrentLocation}
                  className="px-6 py-3 rounded-full font-bold bg-white text-gray-700 hover:bg-gray-100 transition-all"
                >
                  📍 내 위치로
                </button>
                <button
                  onClick={undoLastPoint}
                  className="px-6 py-3 rounded-full font-bold bg-white text-gray-700 hover:bg-gray-100 transition-all"
                >
                  ↶ 되돌리기
                </button>
                <button
                  onClick={clearPath}
                  className="px-6 py-3 rounded-full font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                >
                  🗑️ 경로 지우기
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-r from-black to-gray-800 text-white rounded-3xl p-6 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{stats.points}</div>
                  <div className="text-sm opacity-80">점 개수</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{(stats.distance / 1000).toFixed(2)}km</div>
                  <div className="text-sm opacity-80">총 거리</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.estimatedTime}분</div>
                  <div className="text-sm opacity-80">예상 시간</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.calories}kcal</div>
                  <div className="text-sm opacity-80">예상 칼로리</div>
                </div>
              </div>
              
              {stats.minElevation !== null && stats.maxElevation !== null && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="font-bold">{stats.minElevation.toFixed(1)}m</div>
                      <div className="opacity-80">최저고도</div>
                    </div>
                    <div>
                      <div className="font-bold">{stats.maxElevation.toFixed(1)}m</div>
                      <div className="opacity-80">최고고도</div>
                    </div>
                    <div>
                      <div className="font-bold">{stats.elevationGain.toFixed(1)}m</div>
                      <div className="opacity-80">상승</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Map */}
            <div 
              ref={mapRef}
              className="w-full h-[500px] rounded-3xl shadow-lg mb-6"
              style={{ minHeight: '500px' }}
            />

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/courses')}
                className="flex-1 bg-gray-100 text-gray-900 py-4 rounded-full font-bold hover:bg-gray-200 transition-all active:scale-95"
              >
                취소
              </button>
              <button
                type="button"
                onClick={downloadGPX}
                disabled={currentPath.length < 2 || !courseName.trim()}
                className="flex-1 bg-black text-white py-4 rounded-full font-bold hover:bg-gray-800 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-95"
              >
                💾 GPX 다운로드
              </button>
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 mb-1">사용 방법</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 그리기 모드에서 지도를 클릭하여 경로를 만드세요</li>
                    <li>• 각 점에는 자동으로 고도 정보가 추가됩니다</li>
                    <li>• 최소 2개 이상의 점이 필요합니다</li>
                    <li>• 완성된 경로는 GPX 파일로 다운로드할 수 있습니다</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default CreateCoursePage;