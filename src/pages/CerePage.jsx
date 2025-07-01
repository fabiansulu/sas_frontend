import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Button, Table, Container, Typography, Paper, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Box, TableSortLabel, Grid
} from '@mui/material';
import { cereApi } from '../api/cereApi';

// Ajout Chart.js
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const CerePage = () => {
  const [ceres, setCeres] = useState([]);
  const [filteredCeres, setFilteredCeres] = useState([]);
  const [search, setSearch] = useState({
    date: '',
    dateStart: '',
    dateEnd: '',
    month: '',
    year: '',
    numero_cere: '',
    exportateur: '',
    transitaire: '',
    produit: '',
    emis_a: '',
  });
  const [sortConfig, setSortConfig] = useState({ key: 'date_emission', direction: 'desc' });

  // Récupération des données
  useEffect(() => {
    const fetchCeres = async () => {
      try {
        const response = await cereApi.getAll();
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];
        setCeres(data);
        setFilteredCeres(data);
      } catch (error) {
        console.error('Error fetching CEREs:', error);
        setCeres([]);
        setFilteredCeres([]);
      }
    };
    fetchCeres();
  }, []);

  // Filtrage à chaque modification du formulaire de recherche ou des données
  useEffect(() => {
    let filtered = ceres.filter((cere) => {
      const date = cere.date_emission || '';
      // Filtres de période
      if (search.date && date !== search.date) return false;
      if (search.dateStart && date < search.dateStart) return false;
      if (search.dateEnd && date > search.dateEnd) return false;
      if (search.month && !date.startsWith(search.month)) return false; // format YYYY-MM
      if (search.year && !date.startsWith(search.year)) return false;   // format YYYY

      // Autres filtres
      return (
        (search.numero_cere === '' || (cere.numero_cere && cere.numero_cere.toLowerCase().includes(search.numero_cere.toLowerCase()))) &&
        (search.exportateur === '' || (cere.exportateur && cere.exportateur.designation && cere.exportateur.designation.toLowerCase().includes(search.exportateur.toLowerCase()))) &&
        (search.transitaire === '' || (cere.transitaire && cere.transitaire.designation && cere.transitaire.designation.toLowerCase().includes(search.transitaire.toLowerCase()))) &&
        (search.produit === '' || (cere.produit && cere.produit.designation && cere.produit.designation.toLowerCase().includes(search.produit.toLowerCase()))) &&
        (search.emis_a === '' || (cere.emis_a && (cere.emis_a.poste || cere.emis_a.designation || '').toLowerCase().includes(search.emis_a.toLowerCase())))
      );
    });
    // Appliquer le tri après filtrage
    filtered = sortData(filtered, sortConfig);
    setFilteredCeres(filtered);
  }, [search, ceres, sortConfig]);

  // Fonction de tri
  const sortData = (data, config) => {
    if (!config.key) return data;
    const sorted = [...data].sort((a, b) => {
      let aValue, bValue;
      switch (config.key) {
        case 'date_emission':
          aValue = a.date_emission || '';
          bValue = b.date_emission || '';
          break;
        case 'numero_cere':
          aValue = a.numero_cere || '';
          bValue = b.numero_cere || '';
          break;
        case 'exportateur':
          aValue = a.exportateur?.designation || '';
          bValue = b.exportateur?.designation || '';
          break;
        case 'transitaire':
          aValue = a.transitaire?.designation || '';
          bValue = b.transitaire?.designation || '';
          break;
        case 'produit':
          aValue = a.produit?.designation || '';
          bValue = b.produit?.designation || '';
          break;
        case 'emis_a':
          aValue = a.emis_a?.poste || a.emis_a?.designation || '';
          bValue = b.emis_a?.poste || b.emis_a?.designation || '';
          break;
        case 'poids':
          aValue = Number(a.poids) || 0;
          bValue = Number(b.poids) || 0;
          break;
        default:
          aValue = '';
          bValue = '';
      }
      if (aValue < bValue) return config.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return config.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  // Gestion du tri au clic sur l'en-tête
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        // Inverse la direction si on clique deux fois
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // Calcul des totaux
  const totalCeres = filteredCeres.length;
  const totalPoids = filteredCeres.reduce((sum, cere) => sum + (Number(cere.poids) || 0), 0);

  // Calculs taux radioactivité
  const tauxRadioactiviteList = filteredCeres.map(c => Number(c.taux_radioactivite) || 0);
  const tauxMin = tauxRadioactiviteList.length ? Math.min(...tauxRadioactiviteList) : 0;
  const tauxMax = tauxRadioactiviteList.length ? Math.max(...tauxRadioactiviteList) : 0;
  const tauxMoyen = tauxRadioactiviteList.length ? ((tauxMin + tauxMax) / 2).toFixed(2) : 0;

  // Données graphiques
  // 1. Exportateurs par date (nombre de CERE)
  const exportateurData = {};
  filteredCeres.forEach(c => {
    const date = c.date_emission || '';
    const exp = c.exportateur?.designation || 'Inconnu';
    const key = `${exp} - ${date}`;
    exportateurData[key] = (exportateurData[key] || 0) + 1;
  });
  const exportateurLabels = Object.keys(exportateurData);
  const exportateurValues = Object.values(exportateurData);

  // 2. Transitaires par date (nombre de CERE)
  const transitaireData = {};
  filteredCeres.forEach(c => {
    const date = c.date_emission || '';
    const tra = c.transitaire?.designation || 'Inconnu';
    const key = `${tra} - ${date}`;
    transitaireData[key] = (transitaireData[key] || 0) + 1;
  });
  const transitaireLabels = Object.keys(transitaireData);
  const transitaireValues = Object.values(transitaireData);

  // 3. Produits par date (quantité exportée)
  const produitData = {};
  filteredCeres.forEach(c => {
    const date = c.date_emission || '';
    const prod = c.produit?.designation || 'Inconnu';
    const key = `${prod} - ${date}`;
    produitData[key] = (produitData[key] || 0) + (Number(c.poids) || 0);
  });
  const produitLabels = Object.keys(produitData);
  const produitValues = Object.values(produitData);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        CERTIFICATS D'EVALUATION DE LA RADIOACTIVITE A L'EXPORTATION
      </Typography>
      <Button component={Link} to="/cere/create" variant="contained" sx={{ mb: 3 }}>
        Nouveau CERE
      </Button>
      <Button
        variant="outlined"
        sx={{ mb: 3, ml: 2 }}
        onClick={() => {
          window.open('https://cgea-sas-backend.onrender.com/api/export/cere/excel/', '_blank');
        }}
      >
        Exporter en Excel
      </Button>

      {/* Formulaire de recherche responsive */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Date précise"
              type="date"
              value={search.date}
              onChange={e => setSearch({ ...search, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Du"
              type="date"
              value={search.dateStart}
              onChange={e => setSearch({ ...search, dateStart: e.target.value })}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Au"
              type="date"
              value={search.dateEnd}
              onChange={e => setSearch({ ...search, dateEnd: e.target.value })}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Mois"
              type="month"
              value={search.month}
              onChange={e => setSearch({ ...search, month: e.target.value })}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Année"
              type="number"
              value={search.year}
              onChange={e => setSearch({ ...search, year: e.target.value })}
              size="small"
              inputProps={{ min: 1900, max: 2100 }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Numéro CERE"
              value={search.numero_cere}
              onChange={e => setSearch({ ...search, numero_cere: e.target.value })}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Exportateur"
              value={search.exportateur}
              onChange={e => setSearch({ ...search, exportateur: e.target.value })}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Transitaire"
              value={search.transitaire}
              onChange={e => setSearch({ ...search, transitaire: e.target.value })}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Produit"
              value={search.produit}
              onChange={e => setSearch({ ...search, produit: e.target.value })}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Emis à"
              value={search.emis_a}
              onChange={e => setSearch({ ...search, emis_a: e.target.value })}
              size="small"
              fullWidth
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Statistiques et totaux */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">
          Total CERE enregistrés : <strong>{totalCeres}</strong>
        </Typography>
        <Typography variant="subtitle1">
          Total poids (t) : <strong>{totalPoids}</strong>
        </Typography>
        <Typography variant="subtitle2">
          Taux radioactivité min : <strong>{tauxMin}</strong> | max : <strong>{tauxMax}</strong> | moyen : <strong>{tauxMoyen}</strong>
        </Typography>
      </Box>

      {/* Graphiques */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 4 }}>
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <Typography variant="subtitle2" align="center">Exportateurs / Date (nombre de CERE)</Typography>
          <Bar
            data={{
              labels: exportateurLabels,
              datasets: [{ label: 'CERE', data: exportateurValues, backgroundColor: '#1976d2' }]
            }}
            options={{ responsive: true, plugins: { legend: { display: false } } }}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <Typography variant="subtitle2" align="center">Transitaires / Date (nombre de CERE)</Typography>
          <Bar
            data={{
              labels: transitaireLabels,
              datasets: [{ label: 'CERE', data: transitaireValues, backgroundColor: '#388e3c' }]
            }}
            options={{ responsive: true, plugins: { legend: { display: false } } }}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <Typography variant="subtitle2" align="center">Produits / Date (quantité exportée)</Typography>
          <Bar
            data={{
              labels: produitLabels,
              datasets: [{ label: 'Poids (t)', data: produitValues, backgroundColor: '#fbc02d' }]
            }}
            options={{ responsive: true, plugins: { legend: { display: false } } }}
          />
        </Box>
      </Box>

      {/* Tableau avec tri */}
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'numero_cere'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('numero_cere')}
                >
                  Numéro
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'date_emission'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('date_emission')}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'exportateur'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('exportateur')}
                >
                  Exportateur
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'transitaire'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('transitaire')}
                >
                  Transitaire
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'produit'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('produit')}
                >
                  Produit
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'emis_a'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('emis_a')}
                >
                  Emis à
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'poids'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('poids')}
                >
                  Poids (t)
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCeres.map((cere) => (
              <TableRow key={cere.id}>
                <TableCell>{cere.numero_cere}</TableCell>
                <TableCell>{cere.date_emission}</TableCell>
                <TableCell>{cere.exportateur?.designation}</TableCell>
                <TableCell>{cere.transitaire?.designation}</TableCell>
                <TableCell>{cere.produit?.designation}</TableCell>
                <TableCell>{cere.emis_a?.poste || cere.emis_a?.designation}</TableCell>
                <TableCell>{cere.poids}</TableCell>
                <TableCell>
                  <Button component={Link} to={`/cere/${cere.id}`} size="small">
                    Détails
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredCeres.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Aucun résultat trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default CerePage;