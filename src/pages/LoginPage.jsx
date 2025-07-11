import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link as MuiLink,
  CircularProgress
} from '@mui/material';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(credentials);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'background.default',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: 'background.paper',
          p: 3,
          borderRadius: 2,
          boxShadow: 3,
          maxWidth: 400,
          width: '100%',
        }}
      >
        {/* Titre SAS 2.0 */}
        <Typography component="h1" variant="h4" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
          SAS{' '}
          <Box component="span" sx={{ fontSize: '1.2rem', fontWeight: 'normal', verticalAlign: 'super' }}>
            2.0
          </Box>
        </Typography>
        <Typography component="h2" variant="h5">
          Connexion
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Nom d'utilisateur"
            autoFocus
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Mot de passe"
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? (
              <>
                <CircularProgress size={22} sx={{ mr: 1 }} />
                Connexion en cours...
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
          <Box sx={{ textAlign: 'right' }}>
            <MuiLink href="#" variant="body2">
              Mot de passe oublié ? Veuillez contacter l'administrateur.
            </MuiLink>
          </Box>
        </Box>
      </Box>
      {/* Pied de page */}
      <Box
        component="footer"
        sx={{
          width: '100%',
          textAlign: 'center',
          py: 1,
          bgcolor: 'background.default',
          fontSize: '0.7rem',
          color: 'text.secondary',
          position: 'fixed',
          bottom: 0,
          left: 0,
        }}
      >
        CGEA/CREN - SUIVI AUTOMATIQUE DES STATISTIQUES @2025 - Développé par{' '}
        <MuiLink
          href="https://www.fabiansulu.com"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          color="inherit"
        >
          Fabian Sulu aka Authentik
        </MuiLink>
      </Box>
    </Box>
  );
}