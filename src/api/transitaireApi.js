import api from './axiosConfig';

export const transitaireApi = {
  getAll: () => api.get('transitaire/'),
  getById: (id) => api.get(`transitaire/${id}/`),
  create: (data) => api.post('transitaire/', data),
  update: (id, data) => api.put(`transitaire/${id}/`, data),
  delete: (id) => api.delete(`transitaire/${id}/`),
};