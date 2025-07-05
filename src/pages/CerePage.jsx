import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Button, Table, Container, Typography, Paper, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Box, TableSortLabel, Grid, useMediaQuery
} from '@mui/material';
import { cereApi } from '../api/cereApi';
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
  const isMobile = useMediaQuery('(max-width:900px)');

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
        setCeres([]);
        setFilteredCeres([]);
      }
    };
    fetchCeres();
  }, []);

  useEffect(() => {
    let filtered = ceres.filter((cere) => {
      const date = cere.date_emission || '';
      if (search.date && date !== search.date) return false;
      if (search.dateStart && date < search.dateStart) return false;
      if (search.dateEnd && date > search.dateEnd) return false;
      if (search.month && !date.startsWith(search.month)) return false;
      if (search.year && !date.startsWith(search.year)) return false;
      return (
        (search.numero_cere === '' || (cere.numero_cere && cere.numero_cere.toLowerCase().includes(search.numero_cere.toLowerCase()))) &&
        (search.exportateur === '' || (cere.exportateur && cere.exportateur.designation && cere.exportateur.designation.toLowerCase().includes(search.exportateur.toLowerCase()))) &&
        (search.transitaire === '' || (cere.transitaire && cere.transitaire.designation && cere.transitaire.designation.toLowerCase().includes(search.transitaire.toLowerCase()))) &&
        (search.produit === '' || (cere.produit && cere.produit.designation && cere.produit.designation.toLowerCase().includes(search.produit.toLowerCase()))) &&
        (search.emis_a === '' || (cere.emis_a && (cere.emis_a.poste || cere.emis_a.designation || '').toLowerCase().includes(search.emis_a.toLowerCase())))
      );
    });
    filtered = sortData(filtered, sortConfig);
    setFilteredCeres(filtered);
  }, [search, ceres, sortConfig]);

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

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // Totaux et graphiques
  const totalCeres = filteredCeres.length;
  const totalPoids = filteredCeres.reduce((sum, cere) => sum + (Number(cere.poids) || 0), 0);
  const tauxRadioactiviteList = filteredCeres.map(c => Number(c.taux_radioactivite) || 0);
  const tauxMin = tauxRadioactiviteList.length ? Math.min(...tauxRadioactiviteList) : 0;
  const tauxMax = tauxRadioactiviteList.length ? Math.max(...tauxRadioactiviteList) : 0;
  const tauxMoyen = tauxRadioactiviteList.length ? ((tauxMin + tauxMax) / 2).toFixed(2) : 0;

  const exportateurData = {};
  filteredCeres.forEach(c => {
    const date = c.date_emission || '';
    const exp = c.exportateur?.designation || 'Inconnu';
    const key = `${exp} - ${date}`;
    exportateurData[key] = (exportateurData[key] || 0) + 1;
  });
  const exportateurLabels = Object.keys(exportateurData);
  const exportateurValues = Object.values(exportateurData);

  const transitaireData = {};
  filteredCeres.forEach(c => {
    const date = c.date_emission || '';
    const tra = c.transitaire?.designation || 'Inconnu';
    const key = `${tra} - ${date}`;
    transitaireData[key] = (transitaireData[key] || 0) + 1;
  });
  const transitaireLabels = Object.keys(transitaireData);
  const transitaireValues = Object.values(transitaireData);

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
    <Container maxWidth="xl" sx={{ px: isMobile ? 0.5 : 2 }}>
      <Typography variant={isMobile ? "h6" : "h4"} gutterBottom>
        CERTIFICATS D'EVALUATION DE LA RADIOACTIVITE A L'EXPORTATION
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 2 }}>
        <Button component={Link} to="/cere/create" variant="contained" sx={{ mb: isMobile ? 1 : 0 }}>
          Nouveau CERE
        </Button>
        <Button
          variant="outlined"
          sx={{ mb: isMobile ? 1 : 0 }}
          onClick={() => {
            window.open('https://cgea-sas-backend.onrender.com/api/export/cere/excel/', '_blank');
          }}
        >
          Exporter en Excel
        </Button>
      </Box>

      {/* Formulaire de recherche responsive */}
      <Paper sx={{ p: isMobile ? 1 : 2, mb: 2 }}>
        <Grid container spacing={1}>
          {[
            { label: "Date précise", type: "date", key: "date" },
            { label: "Du", type: "date", key: "dateStart" },
            { label: "Au", type: "date", key: "dateEnd" },
            { label: "Mois", type: "month", key: "month" },
            { label: "Année", type: "number", key: "year", inputProps: { min: 1900, max: 2100 } },
            { label: "Numéro CERE", key: "numero_cere" },
            { label: "Exportateur", key: "exportateur" },
            { label: "Transitaire", key: "transitaire" },
            { label: "Produit", key: "produit" },
            { label: "Emis à", key: "emis_a" },
          ].map((item, idx) => (
            <Grid item xs={12} sm={6} md={3} key={item.key}>
              <TextField
                label={item.label}
                type={item.type || "text"}
                value={search[item.key]}
                onChange={e => setSearch({ ...search, [item.key]: e.target.value })}
                InputLabelProps={item.type === "date" || item.type === "month" ? { shrink: true } : undefined}
                size="small"
                fullWidth
                inputProps={item.inputProps}
              />
            </Grid>
          ))}
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
      <Box sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        flexWrap: 'wrap',
        gap: 2,
        mb: 4
      }}>
        <Box sx={{ flex: 1, minWidth: isMobile ? 200 : 300 }}>
          <Typography variant="subtitle2" align="center">Exportateurs / Date (nombre de CERE)</Typography>
          <Bar
            data={{
              labels: exportateurLabels,
              datasets: [{ label: 'CERE', data: exportateurValues, backgroundColor: '#1976d2' }]
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              maintainAspectRatio: false,
              height: isMobile ? 200 : 300
            }}
            height={isMobile ? 200 : 300}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: isMobile ? 200 : 300 }}>
          <Typography variant="subtitle2" align="center">Transitaires / Date (nombre de CERE)</Typography>
          <Bar
            data={{
              labels: transitaireLabels,
              datasets: [{ label: 'CERE', data: transitaireValues, backgroundColor: '#388e3c' }]
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              maintainAspectRatio: false,
              height: isMobile ? 200 : 300
            }}
            height={isMobile ? 200 : 300}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: isMobile ? 200 : 300 }}>
          <Typography variant="subtitle2" align="center">Produits / Date (quantité exportée)</Typography>
          <Bar
            data={{
              labels: produitLabels,
              datasets: [{ label: 'Poids (t)', data: produitValues, backgroundColor: '#fbc02d' }]
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              maintainAspectRatio: false,
              height: isMobile ? 200 : 300
            }}
            height={isMobile ? 200 : 300}
          />
        </Box>
      </Box>

      {/* Tableau avec scroll horizontal sur mobile */}
      <TableContainer component={Paper} sx={{ overflowX: 'auto', minWidth: isMobile ? 350 : 900 }}>
        <Table size={isMobile ? "small" : "medium"}>
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