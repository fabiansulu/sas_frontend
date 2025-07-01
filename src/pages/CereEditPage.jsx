import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, TextField, Container, Typography, Box, MenuItem, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { cereApi } from '../api/cereApi';
import { exportateurApi } from '../api/exportateurApi';
import { transitaireApi } from '../api/transitaireApi';
import { produitApi } from '../api/produitApi';
import { posteApi } from '../api/posteApi';

const CereEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [exportateurs, setExportateurs] = useState([]);
  const [transitaires, setTransitaires] = useState([]);
  const [produits, setProduits] = useState([]);
  const [postes, setPostes] = useState([]);

  // Charger les listes déroulantes et le CERE à éditer
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupère le CERE à éditer
        const response = await cereApi.getById(id);
        setFormData({
          ...response.data,
          exportateur: response.data.exportateur?.id || '',
          transitaire: response.data.transitaire?.id || '',
          produit: response.data.produit?.id || '',
          emis_a: typeof response.data.emis_a === 'object'
            ? response.data.emis_a?.id || ''
            : response.data.emis_a || '',
          scan: null, // Ne pas pré-remplir le fichier
          contre_verifie: response.data.contre_verifie === true ? true : false,
        });

        // Récupère les listes déroulantes
        const expRes = await exportateurApi.getAll();
        setExportateurs(expRes.data.results || expRes.data || []);
        const transRes = await transitaireApi.getAll();
        setTransitaires(transRes.data.results || transRes.data || []);
        const prodRes = await produitApi.getAll();
        setProduits(prodRes.data.results || prodRes.data || []);
        const posteRes = await posteApi.getAll();
        setPostes(posteRes.data.results || posteRes.data || []);
      } catch (error) {
        alert("Erreur lors du chargement des données.");
        console.error('Erreur lors du chargement du CERE:', error);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
    if (name === 'contre_verifie') {
      setFormData(prev => ({
        ...prev,
        [name]: value === 'true'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'emis_a' ? Number(value) : (files ? files[0] : value),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('exportateur_id', formData.exportateur);
    data.append('transitaire_id', formData.transitaire);
    data.append('produit_id', formData.produit);
    data.append('emis_a_id', formData.emis_a);
    data.append('numero_cere', formData.numero_cere);
    data.append('date_emission', formData.date_emission);
    data.append('numero_lot', formData.numero_lot);
    data.append('taux_radioactivite', formData.taux_radioactivite);
    data.append('poids', formData.poids);
    data.append('contre_verifie', formData.contre_verifie);
    if (formData.scan) data.append('scan', formData.scan);

    try {
      await cereApi.update(id, data); // PATCH ou PUT selon ton API
      navigate(`/cere/${id}`);
    } catch (error) {
      alert("Erreur lors de la modification du certificat.");
      console.error('Error updating CERE:', error);
    }
  };

  if (!formData || produits.length === 0 || exportateurs.length === 0 || transitaires.length === 0 || postes.length === 0) {
    return <div>Chargement...</div>;
  }

  return (
    <Container maxWidth="md"> 
      <Typography variant="h4" gutterBottom>
        Modifier le Certificat d'Exportation
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          type='date'
          label="Date d'Emission"
          name="date_emission"
          value={formData.date_emission || ''}
          onChange={handleChange}
          sx={{ width: '48%' }}
          margin="normal"
          required
          size='small'
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Numéro CERE"
          name="numero_cere"
          value={formData.numero_cere || ''}
          onChange={handleChange}
          sx={{ width: '48%' }}
          margin="normal"
          required
          size='small'
        />
        <TextField
          select
          label="Exportateur"
          name="exportateur"
          value={formData.exportateur || ''}
          onChange={handleChange}
          sx={{ width: '48%' }}
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
        <TextField
          select
          label="Transitaire"
          name="transitaire"
          value={formData.transitaire || ''}
          onChange={handleChange}
          sx={{ width: '48%' }}
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
        <TextField
          label="Numéro de Lot"
          name="numero_lot"
          value={formData.numero_lot || ''}
          onChange={handleChange}
          sx={{ width: '48%' }}
          margin="normal"
          size='small'
          required
        />
        <TextField
          select
          label="Produit"
          name="produit"
          value={formData.produit || ''}
          onChange={handleChange}
          sx={{ width: '48%' }}
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
        <TextField
          type="number"
          step="0.01"
          label="Taux de Rx"
          name="taux_radioactivite"
          value={formData.taux_radioactivite}
          onChange={handleChange}
          sx={{ width: '48%' }}
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
          sx={{ width: '48%' }}
          margin="normal"
          required
          size='small'
        />
        <input 
          type="file" 
          name="scan"
          accept=".pdf,.jpg,.png"
          onChange={handleChange}
          style={{ width: '48%', margin: '8px 0'}}
        />
        <TextField
          select
          label="Emis à"
          name="emis_a"
          value={formData.emis_a}
          onChange={handleChange}
          sx={{ width: '48%' }}
          margin="normal"
          required
          size='small'
        >
          <MenuItem value="">Sélectionner le lieu d'émission</MenuItem>
          {postes.map((a) => (
            <MenuItem key={a.id} value={a.id}>
              {a.site || a.poste || a.designation}
            </MenuItem>
          ))}
        </TextField>
        {/* Champ radio pour contre_verifie */}
        <FormControl component="fieldset" sx={{ width: '48%', mt: 2 }}>
          <FormLabel component="legend">Contre vérification</FormLabel>
          <RadioGroup
            row
            name="contre_verifie"
            value={formData.contre_verifie ? 'true' : 'false'}
            onChange={handleChange}
          >
            <FormControlLabel value="true" control={<Radio color="success" />} label="Oui" />
            <FormControlLabel value="false" control={<Radio color="error" />} label="Non" />
          </RadioGroup>
        </FormControl>
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Enregistrer les modifications
        </Button>
      </Box>
    </Container>
  );
};

export default CereEditPage;