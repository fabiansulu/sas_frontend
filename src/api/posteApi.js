import api from './axiosConfig';

export const posteApi = {
  getAll: () => api.get('poste/'),
  getById: (id) => api.get(`poste/${id}/`),
  create: (data) => api.post('poste/', data),
  update: (id, data) => api.put(`poste/${id}/`, data),
  delete: (id) => api.delete(`poste/${id}/`),
};