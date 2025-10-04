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

export const courseService = {
  getCourses: async (userId, lat, lng, sort = 'distance', page = 0, size = 10) => {
    const response = await api.get('/courses', {
      params: { userId, lat, lng, sort, page, size },
    });
    return response.data;
  },

  getGpxFile: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/file`);
    return response.data;
  },
};