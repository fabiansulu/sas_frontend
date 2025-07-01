import api from './axiosConfig';

export const authApi = {
  login: (credentials) => api.post('token/', credentials),
  refreshToken: () => api.post('token/refresh/'),
  // Inscription utilisateur
  //register: (userData) => api.post('register/', userData),

  // Déconnexion (si endpoint backend prévu, sinon suppression locale du token)
  logout: () => {
    // Si le backend a un endpoint logout, décommente la ligne suivante :
    //return api.post('login/');
    // Sinon, suppression locale du token :
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return Promise.resolve();
  },

  // Demande de réinitialisation du mot de passe (envoi d'email)
  //forgotPassword: (email) => api.post('password/reset/', { email }),

  // Réinitialisation du mot de passe (avec token reçu par email)
  //resetPassword: (data) => api.post('password/reset/confirm/', data),

  // Changement de mot de passe (utilisateur connecté)
  //changePassword: (data) => api.post('password/change/', data),
};