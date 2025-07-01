import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
//import { useAuth } from '../contexts/AuthContext';

const AuthContext = createContext();

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        const userInfo = parseJwt(token);
        if(userInfo){
          setUser(userInfo)
        } else {
          logout();
        }
        //         try {
        //   // Option: Vérifier le token ou récupérer les infos utilisateur
        //   setUser({ /* données utilisateur */ });
        // } catch (error) {
        //   logout();
        // }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    const userInfo = parseJwt(response.data.access);
    setUser(userInfo);
    //setUser(credentials.username);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);