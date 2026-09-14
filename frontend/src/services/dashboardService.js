import api from './api';

export const dashboardService = {
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  getRecentActivities: async (limit = 10) => {
    const response = await api.get('/dashboard/activities', { params: { limit } });
    return response.data;
  },

  getActivityLogs: async (params = {}) => {
    const response = await api.get('/activities', { params });
    return response.data;
  },
};
