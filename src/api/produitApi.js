import api from './axiosConfig';

export const produitApi = {
  getAll: () => api.get('produit/'),
  getById: (id) => api.get(`produit/${id}/`),
  create: (data) => api.post('produit/', data),
  update: (id, data) => api.put(`produit/${id}/`, data),
  delete: (id) => api.delete(`produit/${id}/`),
};