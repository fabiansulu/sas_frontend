import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, TextField, Container, Typography, Box, MenuItem } from '@mui/material';
import { certlApi } from '../api/certlApi';
import { exportateurApi } from '../api/exportateurApi';
import { produitApi } from '../api/produitApi';
import { posteApi } from '../api/posteApi';

const CertlEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [exportateurs, setExportateurs] = useState([]);
  const [produits, setProduits] = useState([]);
  const [postes, setPostes] = useState([]);

  // Charger les listes déroulantes et le CERTL à éditer
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupère le CERTL à éditer
        const response = await certlApi.getById(id);
        setFormData({
          ...response.data,
          operateur_minier: response.data.operateur_minier?.id || '',
          destinateur: response.data.destinateur?.id || '',
          produit: response.data.produit?.id || '',
          emis_a: typeof response.data.emis_a === 'object'
            ? response.data.emis_a?.id || ''
            : response.data.emis_a || '',
          scan: null, // Ne pas pré-remplir le fichier
        });

        // Récupère les listes déroulantes
        const expRes = await exportateurApi.getAll();
        setExportateurs(expRes.data.results || expRes.data || []);
        const prodRes = await produitApi.getAll();
        setProduits(prodRes.data.results || prodRes.data || []);
        const posteRes = await posteApi.getAll();
        setPostes(posteRes.data.results || posteRes.data || []);
      } catch (error) {
        alert("Erreur lors du chargement des données.");
        console.error('Erreur lors du chargement du CERTL:', error);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'emis_a' ? Number(value) : (files ? files[0] : value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('operateur_minier_id', formData.operateur_minier);
    data.append('destinateur_id', formData.destinateur);
    data.append('produit_id', formData.produit);
    data.append('emis_a_id', formData.emis_a);
    data.append('numero_certificat', formData.numero_certificat);
    data.append('date_emission', formData.date_emission);
    data.append('origine', formData.origine);
    data.append('taux_radioactivite', formData.taux_radioactivite);
    data.append('poids', formData.poids);
    if (formData.scan) data.append('scan', formData.scan);

    try {
      await certlApi.update(id, data); // PATCH ou PUT selon ton API
      navigate(`/certl/${id}`);
    } catch (error) {
      alert("Erreur lors de la modification du certificat.");
      console.error('Error updating CERTL:', error);
    }
  };

  if (!formData || produits.length === 0 || exportateurs.length === 0 || postes.length === 0) {
    return <div>Chargement...</div>;
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Modifier le CERTL
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
          label="Numéro CERTL"
          name="numero_certificat"
          value={formData.numero_certificat || ''}
          onChange={handleChange}
          sx={{ width: '48%' }}
          margin="normal"
          required
          size='small'
        />
        <TextField
          select
          label="Opérateur minier"
          name="operateur_minier"
          value={formData.operateur_minier || ''}
          onChange={handleChange}
          sx={{ width: '48%' }}
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
        <TextField
          select
          label="Destinateur"
          name="destinateur"
          value={formData.destinateur || ''}
          onChange={handleChange}
          sx={{ width: '48%' }}
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
        <TextField
          label="Origine"
          name="origine"
          value={formData.origine || ''}
          onChange={handleChange}
          sx={{ width: '48%' }}
          margin="normal"
          required
          size='small'
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
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Enregistrer les modifications
        </Button>
      </Box>
    </Container>
  );
};

export default CertlEditPage;