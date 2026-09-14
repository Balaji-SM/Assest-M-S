import api from './api';

export const assetService = {
  getAssets: async (params = {}) => {
    const response = await api.get('/assets', { params });
    return response.data;
  },

  getAssetById: async (id) => {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },

  createAsset: async (data) => {
    const response = await api.post('/assets', data);
    return response.data;
  },

  updateAsset: async (id, data) => {
    const response = await api.put(`/assets/${id}`, data);
    return response.data;
  },

  deleteAsset: async (id) => {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  },

  getAssetHistory: async (id) => {
    const response = await api.get(`/assets/${id}/history`);
    return response.data;
  },

  assignAsset: async (id, data) => {
    const response = await api.post(`/assets/${id}/assign`, data);
    return response.data;
  },

  returnAsset: async (id, data) => {
    const response = await api.post(`/assets/${id}/return`, data);
    return response.data;
  },
};
