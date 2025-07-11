import { Typography, Box, Button, Paper, Divider } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';

const HomePage = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
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
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 800,
          width: '100%',
          mx: 'auto',
          p: { xs: 2, md: 4 },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            SAS 2.0
          </Typography>
          <Button variant="outlined" color="error" onClick={handleLogout}>
            Déconnexion
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Bienvenue sur la plateforme
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Suivi Automatique des Statistiques des Certificats d'Évaluation de la Radioactivité
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Pour les Exportations et les Transactions locales
          </Typography>
          <Typography variant="h6" color="primary" fontWeight="bold" sx={{ mt: 2 }}>
            Commissariat Général à l'Énergie Atomique
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="h5" align="center" gutterBottom>
          Tableau de bord
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
          <Button
            component={Link}
            to="/cere"
            variant="contained"
            size="large"
            color="primary"
          >
            Gestion CERE
          </Button>
          <Button
            component={Link}
            to="/certl"
            variant="contained"
            size="large"
            color="secondary"
          >
            Gestion CERTL
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default HomePage;