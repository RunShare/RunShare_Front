import api from './api';

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
    }
    return response.data;
  },

  register: async (username, password) => {
    const response = await api.post('/auth/register', { username, password });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  },

  getCurrentUserId: () => {
    return localStorage.getItem('userId');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export const userService = {
  getProfile: async (userId) => {
    const response = await api.get(`/user/${userId}`);
    return response.data;
  },

  updateProfile: async (userId, profileData) => {
    const response = await api.put(`/user/${userId}`, profileData);
    return response.data;
  },
};

/* 
Class:
CourseService : 백엔드로부터 코스를 받아옴

Paramemter:
userId : 조회하는 userId
lat : 사용자의 현재 위도
lng : 사용자의 현재 경도
*/
export const courseService = {
  getCourses: async (userId, lat, lng, sort = 'distance', page = 0, size = 10) => {
    const response = await api.get('/courses', {
      params: { userId, lat, lng, sort, page, size },
    });
    return response.data;
  },

  getGpxFile: async (userId, courseId) => {
    const response = await api.get(`/courses/${courseId}/file`, {
      params: { userId },
    });
    return response.data;
  },

  deleteCourse: async (userId, courseId) => {
    const response = await api.delete(`/courses/${courseId}`, {
      params: { userId },
    });
    return response.data;
  },

  // 코스 생성 API 추가
  createCourse: async (userId, gpxFile) => {
    const formData = new FormData();
    formData.append('userId', userId); // 반드시 'userId'로!
    formData.append('file', gpxFile); // 반드시 'file'로!
    
    const response = await api.post('/courses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};