import { Box, CssBaseline, Typography, Link as MuiLink, Button, Container } from '@mui/material';
import Navbar from './Navbar';
import { useNavigate, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Masquer le bouton retour sur la page d'accueil ("/")
  const hideBack = location.pathname === '/';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <Navbar />
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // centre horizontalement
        justifyContent: 'center', // centre verticalement
        width: '100%',
      }}>
        <Container
          maxWidth="md"
          sx={{
            width: '100%',
            px: { xs: 1, sm: 3, md: 6 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Bouton Retour, masqué sur HomePage */}
          {!hideBack && (
            <Box sx={{ p: { xs: 0.5, md: 1 }, alignSelf: 'flex-start' }}>
              <Button variant="outlined" size="small" onClick={() => navigate(-1)}>
                &#8592; Retour
              </Button>
            </Box>
          )}
          <Box component="main" sx={{ flexGrow: 1, p: { xs: 1, md: 3 }, width: '100%' }}>
            {children}
          </Box>
        </Container>
      </Box>
      <Box
        component="footer"
        sx={{
          width: '100%',
          textAlign: 'center',
          py: 1,
          bgcolor: 'background.default',
          fontSize: { xs: '0.7rem', md: '0.8rem' },
          color: 'text.secondary',
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
};

export default Layout;