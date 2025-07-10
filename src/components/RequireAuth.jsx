import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    // Affiche un loader pendant l'initialisation du contexte Auth
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }
  if (!user) {
    // Redirige vers la page de login si non connecté ou token expiré
    return <Navigate to="/login" replace />;
  }
  return children;
}