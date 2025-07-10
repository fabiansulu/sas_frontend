import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Container, Typography, Box, CircularProgress, Alert, Autocomplete } from '@mui/material';
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

  // Chargement suggestions pour autocomplete (texte uniquement)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [exp, tra, prod, pos] = await Promise.all([
          exportateurApi.getAll({ params: { page_size: 10000 } }),
          transitaireApi.getAll({ params: { page_size: 10000 } }),
          produitApi.getAll({ params: { page_size: 10000 } }),
          posteApi.getAll({ params: { page_size: 10000 } }),
        ]);
        setExportateurs((exp.data.results || exp.data || []).map(e => ({ id: e.id, label: e.designation })).filter(e => e.label));
        setTransitaires((tra.data.results || tra.data || []).map(e => ({ id: e.id, label: e.designation })).filter(e => e.label));
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

  // Pour les champs autocomplete
  const handleAutocompleteChange = (name, option) => {
    setFormData({ ...formData, [name]: option ? option.id : '' });
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
        Nouveau Certificat d'Exportation
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
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
        <Autocomplete
          options={exportateurs}
          getOptionLabel={option => option.label || ''}
          value={exportateurs.find(e => e.id === formData.exportateur) || null}
          onChange={(_, value) => handleAutocompleteChange('exportateur', value)}
          renderInput={params => (
            <TextField {...params} label="Exportateur" margin="normal" required size="small" fullWidth />
          )}
          isOptionEqualToValue={(option, value) => option.id === value?.id}
        />
        <Autocomplete
          options={transitaires}
          getOptionLabel={option => option.label || ''}
          value={transitaires.find(e => e.id === formData.transitaire) || null}
          onChange={(_, value) => handleAutocompleteChange('transitaire', value)}
          renderInput={params => (
            <TextField {...params} label="Transitaire" margin="normal" required size="small" fullWidth />
          )}
          isOptionEqualToValue={(option, value) => option.id === value?.id}
        />
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
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Enregistrer
        </Button>
      </Box>
    </Container>
  );
};

export default CereCreatePage;