import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Container, Typography, Box, CircularProgress, Alert, Autocomplete } from '@mui/material';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pour le résumé des derniers enregistrements
  const [recentCertls, setRecentCertls] = useState([]);

  // Chargement suggestions pour autocomplete (texte uniquement)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [exp, prod, pos] = await Promise.all([
          exportateurApi.getAll({ params: { page_size: 10000 } }),
          produitApi.getAll({ params: { page_size: 10000 } }),
          posteApi.getAll({ params: { page_size: 10000 } }),
        ]);
        setExportateurs((exp.data.results || exp.data || []).map(e => ({ id: e.id, label: e.designation })).filter(e => e.label));
        setProduits((prod.data.results || prod.data || []).map(e => ({ id: e.id, label: e.designation })).filter(e => e.label));
        setPostes((pos.data.results || pos.data || []).map(e => ({ id: e.id, label: e.site || e.poste || e.antenne })).filter(e => e.label));
      } catch (err) {
        setError("Erreur lors du chargement des listes. Vérifiez la connexion au serveur.");
        console.error('Erreur lors du chargement des listes:', err);
      }
      setLoading(false);
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

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'numero_certificat') {
      setFormData({ ...formData, [name]: value.toUpperCase() });
    } else if (name === 'scan') {
      setFormData({ ...formData, scan: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Pour les champs autocomplete
  const handleAutocompleteChange = (name, option) => {
    setFormData({ ...formData, [name]: option ? option.id : '' });
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
      alert("Erreur lors de la création du CERTL.");
      console.error('Error creating CERTL:', error);
    } finally {
      setLoading(false);
      fetchRecentCertls();
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={300}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Chargement des listes...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Nouveau CERTL
      </Typography>
      <Box component="form" onSubmit={e => handleSubmit(e, false)} sx={{ mt: 2 }}>
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
        <TextField
          label="Numéro CERTL"
          name="numero_certificat"
          value={formData.numero_certificat}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          size='small'
          sx={{ textTransform: 'uppercase' }}
        />
        <Autocomplete
          options={exportateurs}
          getOptionLabel={option => option.label || ''}
          value={exportateurs.find(e => e.id === formData.operateur_minier) || null}
          onChange={(_, value) => handleAutocompleteChange('operateur_minier', value)}
          renderInput={params => (
            <TextField {...params} label="Opérateur minier" margin="normal" required size="small" fullWidth />
          )}
          isOptionEqualToValue={(option, value) => option.id === value?.id}
        />
        <Autocomplete
          options={exportateurs}
          getOptionLabel={option => option.label || ''}
          value={exportateurs.find(e => e.id === formData.destinateur) || null}
          onChange={(_, value) => handleAutocompleteChange('destinateur', value)}
          renderInput={params => (
            <TextField {...params} label="Destinateur" margin="normal" required size="small" fullWidth />
          )}
          isOptionEqualToValue={(option, value) => option.id === value?.id}
        />
        <TextField
          label="Origine"
          name="origine"
          value={formData.origine}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          size='small'
        />
        <Autocomplete
          options={produits}
          getOptionLabel={option => option.label || ''}
          value={produits.find(e => e.id === formData.produit) || null}
          onChange={(_, value) => handleAutocompleteChange('produit', value)}
          renderInput={params => (
            <TextField {...params} label="Produit" margin="normal" required size="small" fullWidth />
          )}
          isOptionEqualToValue={(option, value) => option.id === value?.id}
        />
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
        <Box sx={{ my: 2 }}>
          <input 
            type="file" 
            name="scan"
            accept=".pdf,.jpg,.png"
            onChange={handleChange}
            style={{ width: '100%', margin: '8px 0'}}
          />
        </Box>
        <Autocomplete
          options={postes}
          getOptionLabel={option => option.label || ''}
          value={postes.find(e => e.id === formData.emis_a) || null}
          onChange={(_, value) => handleAutocompleteChange('emis_a', value)}
          renderInput={params => (
            <TextField {...params} label="Emis à" margin="normal" required size="small" fullWidth />
          )}
          isOptionEqualToValue={(option, value) => option.id === value?.id}
        />
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
      </Box>

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