import axios from 'axios';

// Configuration de base de l'instance axios
const api = axios.create({
  baseURL: 'https://cgea-sas-backend.onrender.com/api/', // Remplacez par l'URL de votre backend Django
  //headers: { 'Content-Type': 'application/json',  },
});

// Intercepteur pour ajouter le token JWT (si utilisé)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Gérer la déconnexion ici
    }
    if (error.response?.status === 403) {
      // Gérer l'accès interdit ici
    } 
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'token_not_valid' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await api.post('token/refresh/', { refresh: refreshToken });
          localStorage.setItem('access_token', res.data.access);
          api.defaults.headers['Authorization'] = `Bearer ${res.data.access}`;
          originalRequest.headers['Authorization'] = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch (refreshError) { 
          // Si le refresh échoue, déconnecte l'utilisateur
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }
  }
    return Promise.reject(error);
  }
);
 
export default api;