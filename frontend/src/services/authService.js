import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('asset_flow_token', response.data.data.token);
      localStorage.setItem('asset_flow_user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('asset_flow_token', response.data.data.token);
      localStorage.setItem('asset_flow_user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('asset_flow_token');
    localStorage.removeItem('asset_flow_user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('asset_flow_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },
};
