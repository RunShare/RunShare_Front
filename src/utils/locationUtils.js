export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        // 위치 정보를 가져오지 못한 경우 서울 시청 좌표 반환
        console.warn('Failed to get location, using default:', error);
        resolve({
          lat: 37.5665,
          lng: 126.9780,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
};

export const parseGpxToCoordinates = (gpxString) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxString, 'text/xml');
  const trkpts = xmlDoc.getElementsByTagName('trkpt');
  
  const coordinates = [];
  for (let i = 0; i < trkpts.length; i++) {
    const lat = parseFloat(trkpts[i].getAttribute('lat'));
    const lng = parseFloat(trkpts[i].getAttribute('lon'));
    coordinates.push({ lat, lng });
  }
  
  return coordinates;
};