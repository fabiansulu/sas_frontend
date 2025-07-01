import api from './axiosConfig';

export const certlApi = {
  getAll: () => api.get('certl/'),
  getById: (id) => api.get(`certl/${id}/`),
  create: (data) => api.post('certl/', data),
  update: (id, data) => api.put(`certl/${id}/`, data),
  delete: (id) => api.delete(`certl/${id}/`),
};