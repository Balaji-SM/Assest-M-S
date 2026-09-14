import api from './api';

export const maintenanceService = {
  getMaintenanceLogs: async (params = {}) => {
    const response = await api.get('/maintenance', { params });
    return response.data;
  },

  getMaintenanceById: async (id) => {
    const response = await api.get(`/maintenance/${id}`);
    return response.data;
  },

  createMaintenance: async (data) => {
    const response = await api.post('/maintenance', data);
    return response.data;
  },

  updateMaintenance: async (id, data) => {
    const response = await api.put(`/maintenance/${id}`, data);
    return response.data;
  },

  deleteMaintenance: async (id) => {
    const response = await api.delete(`/maintenance/${id}`);
    return response.data;
  },
};
