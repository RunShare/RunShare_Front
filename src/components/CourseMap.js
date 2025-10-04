import React, { useEffect } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
};

function CourseMap({ coordinates }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'
  });

  const [map, setMap] = React.useState(null);

  const onLoad = React.useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  useEffect(() => {
    if (!map || !isLoaded || coordinates.length === 0) return;

    // 20개마다 하나씩만 마커 표시
    coordinates.forEach((point, index) => {
      if (index % 20 === 0) {  // 0, 20, 40, 60...
        new window.google.maps.Marker({
          position: { lat: point.lat, lng: point.lng },
          map: map,
          title: `점 ${index + 1}`,
          label: ((index / 20) + 1).toString()  // 1, 2, 3, 4...로 라벨링
        });
      }
    });

    // 폴리라인은 모든 좌표 사용 (경로는 그대로)
    const polyline = new window.google.maps.Polyline({
      path: coordinates.map(p => ({ lat: p.lat, lng: p.lng })),
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 4,
    });
    polyline.setMap(map);

    // 경로 전체가 보이도록 조정
    const bounds = new window.google.maps.LatLngBounds();
    coordinates.forEach(point => bounds.extend({ lat: point.lat, lng: point.lng }));
    map.fitBounds(bounds);

  }, [map, isLoaded, coordinates]);

  if (!isLoaded) return <div>로딩 중...</div>;

  const center = coordinates.length > 0 
    ? { lat: coordinates[0].lat, lng: coordinates[0].lng }
    : { lat: 37.5665, lng: 126.9780 };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={14}
      onLoad={onLoad}
    />
  );
}

export default CourseMap;