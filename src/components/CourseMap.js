import React, { useEffect } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
};

function CourseMap({ coordinates }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY 
  });

  const [map, setMap] = React.useState(null);

  const onLoad = React.useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  useEffect(() => {
    if (!map || !isLoaded || coordinates.length === 0) return;

    // 마커들을 저장할 배열
    const markers = [];

    // 20개마다 하나씩만 마커 표시 (깔끔한 표시)
    coordinates.forEach((point, index) => {
      if (index % 20 === 0) {
        const marker = new window.google.maps.Marker({
          position: { lat: point.lat, lng: point.lng },
          map: map,
          title: `포인트 ${index + 1}`,
          label: {
            text: ((index / 20) + 1).toString(),
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#000000',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          }
        });
        markers.push(marker);
      }
    });

    // 시작점 마커 (녹색)
    const startMarker = new window.google.maps.Marker({
      position: { lat: coordinates[0].lat, lng: coordinates[0].lng },
      map: map,
      title: '시작점',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#10B981',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 3,
      },
      zIndex: 1000
    });

    // 종료점 마커 (빨간색)
    if (coordinates.length > 1) {
      const endMarker = new window.google.maps.Marker({
        position: { lat: coordinates[coordinates.length - 1].lat, lng: coordinates[coordinates.length - 1].lng },
        map: map,
        title: '종료점',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#EF4444',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3,
        },
        zIndex: 1000
      });
    }

    // 폴리라인 (경로) - 검은색으로 변경
    const polyline = new window.google.maps.Polyline({
      path: coordinates.map(p => ({ lat: p.lat, lng: p.lng })),
      geodesic: true,
      strokeColor: "#000000",
      strokeOpacity: 0.8,
      strokeWeight: 4,
    });
    polyline.setMap(map);

    // 경로 전체가 보이도록 조정
    const bounds = new window.google.maps.LatLngBounds();
    coordinates.forEach(point => bounds.extend({ lat: point.lat, lng: point.lng }));
    map.fitBounds(bounds);

    // 클린업 함수
    return () => {
      markers.forEach(marker => marker.setMap(null));
      polyline.setMap(null);
    };

  }, [map, isLoaded, coordinates]);

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">지도를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const center = coordinates.length > 0 
    ? { lat: coordinates[0].lat, lng: coordinates[0].lng }
    : { lat: 37.5665, lng: 126.9780 };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={14}
      onLoad={onLoad}
      options={{
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    />
  );
}

export default CourseMap;