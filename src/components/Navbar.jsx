import React, { useState } from 'react';
import {
  Drawer, List, ListItemIcon, ListItemText, ListItemButton, IconButton, Box, Typography, Divider
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import {
  Description, Home, ListAlt, Menu, Logout, LocalShipping, Store, Business, LocationOn
} from '@mui/icons-material';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Ajoute ici ta logique de déconnexion si besoin
    // Par exemple : authApi.logout().then(() => navigate('/login'));
    navigate('/login');
  };

  return (
    <>
      {/* Bouton toggle du menu */}
      <IconButton
        onClick={() => setOpen(true)}
        sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1301 }}
        color="primary"
        aria-label="Ouvrir le menu"
      >
        <Menu />
      </IconButton>
      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 260, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Titre de l'application */}
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6" align="center" fontWeight="bold">
              SAS 2.0
            </Typography>
          </Box>
          <Divider />
          <List sx={{ flexGrow: 1 }}>
            <ListItemButton component={Link} to="/" onClick={() => setOpen(false)}>
              <ListItemIcon><Home /></ListItemIcon>
              <ListItemText primary="Accueil" />
            </ListItemButton>
            <ListItemButton component={Link} to="/cere" onClick={() => setOpen(false)}>
              <ListItemIcon><Description /></ListItemIcon>
              <ListItemText primary="CERE" />
            </ListItemButton>
            <ListItemButton component={Link} to="/certl" onClick={() => setOpen(false)}>
              <ListItemIcon><ListAlt /></ListItemIcon>
              <ListItemText primary="CERTL" />
            </ListItemButton>
            <Divider sx={{ my: 1 }} />
            <ListItemButton component={Link} to="/exportateurs" onClick={() => setOpen(false)}>
              <ListItemIcon><Business /></ListItemIcon>
              <ListItemText primary="Exportateurs" />
            </ListItemButton>
            <ListItemButton component={Link} to="/produits" onClick={() => setOpen(false)}>
              <ListItemIcon><Store /></ListItemIcon>
              <ListItemText primary="Produits" />
            </ListItemButton>
            <ListItemButton component={Link} to="/transitaires" onClick={() => setOpen(false)}>
              <ListItemIcon><LocalShipping /></ListItemIcon>
              <ListItemText primary="Transitaires" />
            </ListItemButton>
            <ListItemButton component={Link} to="/postes" onClick={() => setOpen(false)}>
              <ListItemIcon><LocationOn /></ListItemIcon>
              <ListItemText primary="Postes" />
            </ListItemButton>
          </List>
          <Divider />
          {/* Bouton de déconnexion en bas */}
          <List>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon><Logout /></ListItemIcon>
              <ListItemText primary="Déconnexion" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;