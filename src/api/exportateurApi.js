import api from './axiosConfig';

export const exportateurApi = {
  getAll: () => api.get('exportateur/'),
  getById: (id) => api.get(`exportateur/${id}/`),
  create: (data) => api.post('exportateur/', data),
  update: (id, data) => api.put(`exportateur/${id}/`, data),
  delete: (id) => api.delete(`exportateur/${id}/`),
};