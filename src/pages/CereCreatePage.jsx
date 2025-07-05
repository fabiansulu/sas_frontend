import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Container, Typography, MenuItem, Grid, Box, CircularProgress, Alert } from '@mui/material';
import { cereApi } from '../api/cereApi';
import { exportateurApi } from '../api/exportateurApi';
import { transitaireApi } from '../api/transitaireApi';
import { produitApi } from '../api/produitApi';
import { posteApi } from '../api/posteApi';
import { useAuth } from '../contexts/AuthContext';

const today = new Date().toISOString().split('T')[0];

const CODES_AUTORISES = ['LSH', 'LSI', 'KZI', 'SKN', 'PWE', 'KIS', 'KSA', 'KPS'];

const validateNumeroCere = (value) => {
  const regex = /^([A-Z]{3})-(\d{4,6})-(\d{4})$/;
  const match = value.match(regex);
  if (!match) return "Format attendu : CODE-1234-YYYY";
  if (!CODES_AUTORISES.includes(match[1])) return "Code non autorisé";
  const year = parseInt(match[3], 10);
  if (year < 2000 || year > 2100) return "Année invalide";
  return '';
};

const CereCreatePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    numero_cere: '',
    date_emission: today,
    exportateur: '',
    transitaire: '',
    numero_lot: '',
    taux_radioactivite: '',
    produit: '',
    poids: '',
    scan: null,
    emis_a: '',
    enregistre_le: today,
    enregistre_par: '',
  });
  const [exportateurs, setExportateurs] = useState([]);
  const [transitaires, setTransitaires] = useState([]);
  const [produits, setProduits] = useState([]);
  const [postes, setPostes] = useState([]);
  const [numeroCereError, setNumeroCereError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async (api, key = 'designation') => {
      let results = [];
      let page = 1;
      let hasNext = true;
      while (hasNext) {
        const res = await api.getAll({ params: { page, page_size: 1000 } });
        const data = res.data.results || res.data || [];
        results = results.concat(data);
        hasNext = !!res.data.next;
        page += 1;
      }
      // Tri alphabétique
      return results.sort((a, b) => (a[key] || '').localeCompare(b[key] || ''));
    };

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [exp, tra, prod, pos] = await Promise.all([
          fetchAll(exportateurApi, 'designation'),
          fetchAll(transitaireApi, 'designation'),
          fetchAll(produitApi, 'designation'),
          fetchAll(posteApi, 'poste'),
        ]);
        setExportateurs(exp);
        setTransitaires(tra);
        setProduits(prod);
        setPostes(pos);
      } catch (err) {
        setError("Erreur lors du chargement des listes. Vérifiez la connexion au serveur.");
        console.error('Erreur lors du chargement des listes:', err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'numero_cere') {
      const upper = value.toUpperCase();
      setFormData({ ...formData, [name]: upper });
      setNumeroCereError(validateNumeroCere(upper));
    } else if (name === 'scan') {
      setFormData({ ...formData, scan: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (numeroCereError) return;
    const data = new FormData();
    data.append('exportateur_id', formData.exportateur);
    data.append('transitaire_id', formData.transitaire);
    data.append('produit_id', formData.produit);
    data.append('emis_a_id', formData.emis_a);
    Object.entries(formData).forEach(([key, value]) => {
      if(['exportateur', 'transitaire', 'produit', 'emis_a'].includes(key)) return;
      if (key === 'scan' && !value) return;
      data.append(key, value);
    });

    try {
      await cereApi.create(data);
      navigate('/cere');
    } catch (error) {
      alert("Erreur lors de la création du certificat.");
      console.error('Error creating CERE:', error);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={300}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Chargement des listes...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Nouveau Certificat d'Exportation
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              type='date'
              label="Date d'Emission"
              name="date_emission"
              value={formData.date_emission}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              size='small'
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Numéro CERE"
              name="numero_cere"
              value={formData.numero_cere}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              size='small'
              error={!!numeroCereError}
              helperText={numeroCereError || "Ex: LSH-123456-2025"}
              sx={{ textTransform: 'uppercase' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Exportateur"
              name="exportateur"
              value={formData.exportateur}
              onChange={handleChange}
              fullWidth
              size='small'
              margin="normal"
              required
            >
              <MenuItem value="">Sélectionner un exportateur</MenuItem>
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
              label="Transitaire"
              name="transitaire"
              value={formData.transitaire}
              onChange={handleChange}
              fullWidth
              margin="normal"
              size='small'
              required
            >
              <MenuItem value="">Sélectionner un transitaire</MenuItem>
              {transitaires.map((tra) => (
                <MenuItem key={tra.id} value={tra.id}>
                  {tra.designation || tra.sigle}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Numéro de Lot"
              name="numero_lot"
              value={formData.numero_lot}
              onChange={handleChange}
              fullWidth
              margin="normal"
              size='small'
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Produit"
              name="produit"
              value={formData.produit}
              onChange={handleChange}
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
              name="taux_radioactivite"
              value={formData.taux_radioactivite}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              size='small'
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Poids"
              name="poids"
              type='number'
              step="0.01"
              placeholder="Poids en tonnes"
              value={formData.poids}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              size='small'
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <input 
              type="file" 
              name="scan"
              accept=".pdf,.jpg,.png"
              onChange={handleChange}
              style={{ width: '100%', margin: '8px 0'}}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Emis à"
              name="emis_a"
              value={formData.emis_a}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              size='small'
            >
              <MenuItem value="">Sélectionner le lieu d'émission</MenuItem>
              {postes.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.poste || a.site || a.designation}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
              Enregistrer
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default CereCreatePage;