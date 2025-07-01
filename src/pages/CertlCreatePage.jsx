import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Container, Typography, Box, MenuItem, Grid } from '@mui/material';
import { certlApi } from '../api/certlApi';
import { exportateurApi } from '../api/exportateurApi';
import { produitApi } from '../api/produitApi';
import { posteApi } from '../api/posteApi';
import { useAuth } from '../contexts/AuthContext';

const today = new Date().toISOString().split('T')[0];

const CertlCreatePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date_emission: today,
    numero_certificat: '',
    operateur_minier: '',
    destinateur: '',
    origine: '',
    produit: '',
    taux_radioactivite: '',
    poids: '',
    scan: null,
    emis_a: '',
  });
  const [exportateurs, setExportateurs] = useState([]);
  const [produits, setProduits] = useState([]);
  const [postes, setPostes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pour le résumé des derniers enregistrements
  const [recentCertls, setRecentCertls] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const expRes = await exportateurApi.getAll();
        setExportateurs(expRes.data.results || expRes.data || []);
        const prodRes = await produitApi.getAll();
        setProduits(prodRes.data.results || prodRes.data || []);
        const posteRes = await posteApi.getAll();
        setPostes(posteRes.data.results || posteRes.data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des listes:', error);
      }
    };
    fetchData();
  }, []);

  // Récupère les derniers enregistrements CERTL
  const fetchRecentCertls = async () => {
    try {
      const res = await certlApi.getAll();
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      // Trie par date décroissante et prend les 5 plus récents
      const sorted = [...data].sort((a, b) => (b.date_emission > a.date_emission ? 1 : -1));
      setRecentCertls(sorted.slice(0, 5));
    } catch (error) {
      setRecentCertls([]);
    }
  };

  useEffect(() => {
    fetchRecentCertls();
  }, []);

  const resetForm = () => {
    setFormData({
      date_emission: today,
      numero_certificat: '',
      operateur_minier: '',
      destinateur: '',
      origine: '',
      produit: '',
      taux_radioactivite: '',
      poids: '',
      scan: null,
      emis_a: '',
    });
    fetchRecentCertls();
  };

  const handleSubmit = async (e, keepOpen = false) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append('operateur_minier_id', formData.operateur_minier);
    data.append('destinateur_id', formData.destinateur);
    data.append('produit_id', formData.produit);
    data.append('emis_a_id', formData.emis_a);

    Object.entries(formData).forEach(([key, value]) => {
      if(['operateur_minier', 'destinateur', 'produit', 'emis_a'].includes(key)) return;
      if (key === 'scan' && !value) return;
      data.append(key, value);
    });

    try {
      await certlApi.create(data);
      if (keepOpen) {
        resetForm();
      } else {
        navigate('/certl');
      }
    } catch (error) {
      console.error('Error creating CERTL:', error);
    } finally {
      setLoading(false);
      fetchRecentCertls();
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Nouveau CERTL
      </Typography>
      <form onSubmit={e => handleSubmit(e, false)}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              type='date'
              label="Date d'Emission"
              value={formData.date_emission}
              onChange={(e) => setFormData({...formData, date_emission: e.target.value})}
              fullWidth
              margin="normal"
              required
              size='small'
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Numéro CERTL"
              value={formData.numero_certificat}
              onChange={(e) => setFormData({...formData, numero_certificat: e.target.value.toUpperCase()})}
              fullWidth
              margin="normal"
              required
              size='small'
              sx={{ textTransform: 'uppercase' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Opérateur minier"
              value={formData.operateur_minier}
              onChange={(e) => setFormData({...formData, operateur_minier: e.target.value})}
              fullWidth
              size='small'
              margin="normal"
              required
            >
              <MenuItem value="">Sélectionner un opérateur</MenuItem>
              {exportateurs.map((exp) => (
                <MenuItem key={exp.id} value={exp.id}>
                  {exp.designation || exp.sigle}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Destinateur"
              value={formData.destinateur}
              onChange={(e) => setFormData({...formData, destinateur: e.target.value})}
              fullWidth
              size='small'
              margin="normal"
              required
            >
              <MenuItem value="">Sélectionner un destinateur</MenuItem>
              {exportateurs.map((exp) => (
                <MenuItem key={exp.id} value={exp.id}>
                  {exp.designation || exp.sigle}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Origine"
              value={formData.origine}
              onChange={(e) => setFormData({...formData, origine: e.target.value})}
              fullWidth
              margin="normal"
              required
              size='small'
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Produit"
              value={formData.produit}
              onChange={(e) => setFormData({...formData, produit: e.target.value})}
              fullWidth
              margin="normal"
              required
              size='small'
            >
              <MenuItem value="">Sélectionner un produit</MenuItem>
              {produits.map((prod) => (
                <MenuItem key={prod.id} value={prod.id}>
                  {prod.designation || prod.abbreviation}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              type="number"
              step="0.01"
              label="Taux de Rx"
              value={formData.taux_radioactivite}
              onChange={(e) => setFormData({...formData, taux_radioactivite: e.target.value})}
              fullWidth
              margin="normal"
              required
              size='small'
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Poids"
              type='number'
              step="0.01"
              placeholder="Poids en tonnes"
              value={formData.poids}
              onChange={(e) => setFormData({...formData, poids: e.target.value})}
              fullWidth
              margin="normal"
              required
              size='small'
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <input 
              type="file" 
              accept=".pdf,.jpg,.png"
              onChange={e => setFormData ({ ...formData, scan: e.target.files[0]})}
              style={{ width: '100%', margin: '8px 0'}}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Emis à"
              value={formData.emis_a}
              onChange={(e) => setFormData({...formData, emis_a: e.target.value})}
              fullWidth
              margin="normal"
              required
              size='small'
            >
              <MenuItem value="">Sélectionner le lieu d'émission</MenuItem>
              {postes.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.site || a.poste}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button type="submit" variant="contained" disabled={loading} fullWidth>
                Enregistrer
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={e => handleSubmit(e, true)}
                type="button"
                disabled={loading}
                fullWidth
              >
                Enregistrer et nouveau
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      {/* Résumé des derniers enregistrements */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Derniers CERTL enregistrés
        </Typography>
        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', overflowX: 'auto' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ccc', padding: 4 }}>Date émission</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: 4 }}>Numéro CERTL</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: 4 }}>Opérateur</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: 4 }}>Destinateur</th>
            </tr>
          </thead>
          <tbody>
            {recentCertls.map(certl => (
              <tr key={certl.id}>
                <td style={{ borderBottom: '1px solid #eee', padding: 4 }}>{certl.date_emission}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: 4 }}>{certl.numero_certificat}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: 4 }}>{certl.operateur_minier?.designation}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: 4 }}>{certl.destinateur?.designation}</td>
              </tr>
            ))}
            {recentCertls.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 8 }}>Aucun enregistrement récent.</td>
              </tr>
            )}
          </tbody>
        </Box>
      </Box>
    </Container>
  );
};

export default CertlCreatePage;