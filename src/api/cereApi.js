import api from './axiosConfig';

export const cereApi = {
  getAll: () => api.get('cere/'),
  getById: (id) => api.get(`cere/${id}/`),
  create: (data) => api.post('cere/', data),
  update: (id, data) => api.put(`cere/${id}/`, data),
  delete: (id) => api.delete(`cere/${id}/`),
};