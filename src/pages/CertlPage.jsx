import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Button, Table, Container, Typography, Paper, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Box, TableSortLabel, Grid, useMediaQuery
} from '@mui/material';
import { certlApi } from '../api/certlApi';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const CertlPage = () => {
  const [certls, setCertls] = useState([]);
  const [filteredCertls, setFilteredCertls] = useState([]);
  const [search, setSearch] = useState({
    date: '',
    dateStart: '',
    dateEnd: '',
    month: '',
    year: '',
    numero_certificat: '',
    operateur_minier: '',
    destinateur: '',
    produit: '',
    origine: '',
    emis_a: '',
  });
  const [sortConfig, setSortConfig] = useState({ key: 'date_emission', direction: 'desc' });
  const isMobile = useMediaQuery('(max-width:900px)');

  useEffect(() => {
    const fetchCertls = async () => {
      try {
        const response = await certlApi.getAll();
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];
        setCertls(data);
        setFilteredCertls(data);
      } catch (error) {
        setCertls([]);
        setFilteredCertls([]);
      }
    };
    fetchCertls();
  }, []);

  useEffect(() => {
    let filtered = certls.filter((certl) => {
      const date = certl.date_emission || '';
      if (search.date && date !== search.date) return false;
      if (search.dateStart && date < search.dateStart) return false;
      if (search.dateEnd && date > search.dateEnd) return false;
      if (search.month && !date.startsWith(search.month)) return false;
      if (search.year && !date.startsWith(search.year)) return false;
      return (
        (search.numero_certificat === '' || (certl.numero_certificat && certl.numero_certificat.toLowerCase().includes(search.numero_certificat.toLowerCase()))) &&
        (search.operateur_minier === '' || (certl.operateur_minier && certl.operateur_minier.designation && certl.operateur_minier.designation.toLowerCase().includes(search.operateur_minier.toLowerCase()))) &&
        (search.destinateur === '' || (certl.destinateur && certl.destinateur.designation && certl.destinateur.designation.toLowerCase().includes(search.destinateur.toLowerCase()))) &&
        (search.produit === '' || (certl.produit && certl.produit.designation && certl.produit.designation.toLowerCase().includes(search.produit.toLowerCase()))) &&
        (search.origine === '' || (certl.origine && certl.origine.toLowerCase().includes(search.origine.toLowerCase()))) &&
        (search.emis_a === '' || (certl.emis_a && (certl.emis_a.poste || certl.emis_a.designation || '').toLowerCase().includes(search.emis_a.toLowerCase())))
      );
    });
    filtered = sortData(filtered, sortConfig);
    setFilteredCertls(filtered);
  }, [search, certls, sortConfig]);

  const sortData = (data, config) => {
    if (!config.key) return data;
    const sorted = [...data].sort((a, b) => {
      let aValue, bValue;
      switch (config.key) {
        case 'date_emission':
          aValue = a.date_emission || '';
          bValue = b.date_emission || '';
          break;
        case 'numero_certificat':
          aValue = a.numero_certificat || '';
          bValue = b.numero_certificat || '';
          break;
        case 'operateur_minier':
          aValue = a.operateur_minier?.designation || '';
          bValue = b.operateur_minier?.designation || '';
          break;
        case 'destinateur':
          aValue = a.destinateur?.designation || '';
          bValue = b.destinateur?.designation || '';
          break;
        case 'produit':
          aValue = a.produit?.designation || '';
          bValue = b.produit?.designation || '';
          break;
        case 'origine':
          aValue = a.origine || '';
          bValue = b.origine || '';
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
  const totalCertls = filteredCertls.length;
  const totalPoids = filteredCertls.reduce((sum, certl) => sum + (Number(certl.poids) || 0), 0);
  const tauxRadioactiviteList = filteredCertls.map(c => Number(c.taux_radioactivite) || 0);
  const tauxMin = tauxRadioactiviteList.length ? Math.min(...tauxRadioactiviteList) : 0;
  const tauxMax = tauxRadioactiviteList.length ? Math.max(...tauxRadioactiviteList) : 0;
  const tauxMoyen = tauxRadioactiviteList.length ? ((tauxMin + tauxMax) / 2).toFixed(2) : 0;

  const operateurData = {};
  filteredCertls.forEach(c => {
    const date = c.date_emission || '';
    const op = c.operateur_minier?.designation || 'Inconnu';
    const key = `${op} - ${date}`;
    operateurData[key] = (operateurData[key] || 0) + 1;
  });
  const operateurLabels = Object.keys(operateurData);
  const operateurValues = Object.values(operateurData);

  const destinateurData = {};
  filteredCertls.forEach(c => {
    const date = c.date_emission || '';
    const dest = c.destinateur?.designation || 'Inconnu';
    const key = `${dest} - ${date}`;
    destinateurData[key] = (destinateurData[key] || 0) + 1;
  });
  const destinateurLabels = Object.keys(destinateurData);
  const destinateurValues = Object.values(destinateurData);

  const produitData = {};
  filteredCertls.forEach(c => {
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
        CERTIFICATS D'EVALUATION DE LA RADIOACTIVITE POUR LES TRANSACTIONS LOCALES
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 2 }}>
        <Button component={Link} to="/certl/create" variant="contained" sx={{ mb: isMobile ? 1 : 0 }}>
          Nouveau CERTL
        </Button>
        <Button
          variant="outlined"
          sx={{ mb: isMobile ? 1 : 0 }}
          onClick={() => {
            window.open('https://cgea-sas-backend.onrender.com/api/export/certl/excel/', '_blank');
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
            { label: "Numéro CERTL", key: "numero_certificat" },
            { label: "Opérateur minier", key: "operateur_minier" },
            { label: "Destinateur", key: "destinateur" },
            { label: "Produit", key: "produit" },
            { label: "Origine", key: "origine" },
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
          Total CERTL enregistrés : <strong>{totalCertls}</strong>
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
          <Typography variant="subtitle2" align="center">Opérateurs miniers / Date (nombre de CERTL)</Typography>
          <Bar
            data={{
              labels: operateurLabels,
              datasets: [{ label: 'CERTL', data: operateurValues, backgroundColor: '#1976d2' }]
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
          <Typography variant="subtitle2" align="center">Destinateurs / Date (nombre de CERTL)</Typography>
          <Bar
            data={{
              labels: destinateurLabels,
              datasets: [{ label: 'CERTL', data: destinateurValues, backgroundColor: '#388e3c' }]
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
          <Typography variant="subtitle2" align="center">Produits / Date (quantité)</Typography>
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
                  active={sortConfig.key === 'numero_certificat'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('numero_certificat')}
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
                  active={sortConfig.key === 'operateur_minier'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('operateur_minier')}
                >
                  Opérateur Minier
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'destinateur'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('destinateur')}
                >
                  Destinateur
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'origine'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('origine')}
                >
                  Origine
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
            {filteredCertls.map((certl) => (
              <TableRow key={certl.id}>
                <TableCell>{certl.numero_certificat}</TableCell>
                <TableCell>{certl.date_emission}</TableCell>
                <TableCell>{certl.operateur_minier?.designation}</TableCell>
                <TableCell>{certl.destinateur?.designation}</TableCell>
                <TableCell>{certl.origine}</TableCell>
                <TableCell>{certl.produit?.designation}</TableCell>
                <TableCell>{certl.poids}</TableCell>
                <TableCell>
                  <Button component={Link} to={`/certl/${certl.id}`} size="small">
                    Détails
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredCertls.length === 0 && (
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

export default CertlPage;