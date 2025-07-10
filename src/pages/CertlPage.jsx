import React, { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import ErrorDisplay from '../components/ErrorDisplay';
import { Link } from 'react-router-dom';
import {
  Button, Table, Container, Typography, Paper, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Box, TableSortLabel, Grid, useMediaQuery,
  TablePagination, Autocomplete
} from '@mui/material';
import { certlApi } from '../api/certlApi';
import { exportateurApi } from '../api/exportateurApi';
import { produitApi } from '../api/produitApi';
import { posteApi } from '../api/posteApi';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const CertlPage = () => {
  const [certls, setCertls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  // Pagination globale
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Pour les listes de suggestions autocomplete (texte uniquement)
  const [operateurs, setOperateurs] = useState([]);
  const [destinateurs, setDestinateurs] = useState([]);
  const [produits, setProduits] = useState([]);
  const [postes, setPostes] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    certlApi.getAll()
      .then(response => {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];
        setCertls(data);
        setFilteredCertls(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Erreur lors de la récupération des CERTLs. Veuillez réessayer plus tard.');
        setLoading(false);
        setCertls([]);
        setFilteredCertls([]);
      });
  }, []);

  // Chargement suggestions pour autocomplete (texte uniquement)
  useEffect(() => {
    setLoadingDropdowns(true);
    Promise.all([
      exportateurApi.getAll({ params: { page_size: 10000 } }),
      exportateurApi.getAll({ params: { page_size: 10000 } }),
      produitApi.getAll({ params: { page_size: 10000 } }),
      posteApi.getAll({ params: { page_size: 10000 } }),
    ]).then(([op, dest, prod, pos]) => {
      setOperateurs((op.data.results || op.data || []).map(e => e.designation).filter(Boolean));
      setDestinateurs((dest.data.results || dest.data || []).map(e => e.designation).filter(Boolean));
      setProduits((prod.data.results || prod.data || []).map(e => e.designation).filter(Boolean));
      setPostes((pos.data.results || pos.data || []).map(e => e.poste || e.designation || e.site).filter(Boolean));
      setLoadingDropdowns(false);
    }).catch(() => setLoadingDropdowns(false));
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
    setPage(0); // reset page on filter
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

  // Pagination handlers
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Statistiques et graphiques
  const totalCertls = filteredCertls.length;
  const totalPoids = filteredCertls.reduce((sum, certl) => sum + (Number(certl.poids) || 0), 0);
  const tauxRadioactiviteList = filteredCertls.map(c => Number(c.taux_radioactivite) || 0);
  const tauxMin = tauxRadioactiviteList.length ? Math.min(...tauxRadioactiviteList) : 0;
  const tauxMax = tauxRadioactiviteList.length ? Math.max(...tauxRadioactiviteList) : 0;
  const tauxMoyen = tauxRadioactiviteList.length ? ((tauxMin + tauxMax) / 2).toFixed(2) : 0;

  // Graphiques dynamiques
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

  if (loading) return <Loader text="Chargement des certificats..." />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <Container maxWidth="xl" sx={{ px: isMobile ? 0.5 : 2 }}>
      <Typography variant={isMobile ? "h6" : "h4"} gutterBottom>
        CCR - TRANSACTIONS LOCALES
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

      {/* Formulaire de recherche responsive avec autocomplete freeSolo */}
      <Paper sx={{ p: isMobile ? 1 : 2, mb: 2 }}>
        <Grid container spacing={1}>
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
              InputLabelProps={{ shrink: true }}
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
              fullWidth
              inputProps={{ min: 1900, max: 2100 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Numéro CERTL"
              value={search.numero_certificat}
              onChange={e => setSearch({ ...search, numero_certificat: e.target.value })}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              freeSolo
              options={operateurs}
              loading={loadingDropdowns}
              value={search.operateur_minier || ''}
              onInputChange={(_, value) => setSearch({ ...search, operateur_minier: value })}
              renderInput={params => (
                <TextField {...params} label="Opérateur minier" size="small" fullWidth />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              freeSolo
              options={destinateurs}
              loading={loadingDropdowns}
              value={search.destinateur || ''}
              onInputChange={(_, value) => setSearch({ ...search, destinateur: value })}
              renderInput={params => (
                <TextField {...params} label="Destinateur" size="small" fullWidth />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              freeSolo
              options={produits}
              loading={loadingDropdowns}
              value={search.produit || ''}
              onInputChange={(_, value) => setSearch({ ...search, produit: value })}
              renderInput={params => (
                <TextField {...params} label="Produit" size="small" fullWidth />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Origine"
              value={search.origine}
              onChange={e => setSearch({ ...search, origine: e.target.value })}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              freeSolo
              options={postes}
              loading={loadingDropdowns}
              value={search.emis_a || ''}
              onInputChange={(_, value) => setSearch({ ...search, emis_a: value })}
              renderInput={params => (
                <TextField {...params} label="Emis à" size="small" fullWidth />
              )}
            />
          </Grid>
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

      {/* Graphiques dynamiques et responsives */}
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
              responsive: false,
              plugins: { legend: { display: false } },
              maintainAspectRatio: true,
              
            }}
            style={{ width: '100%', height: 250 }}
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
              responsive: false,
              plugins: { legend: { display: false } },
              maintainAspectRatio: true,
              
            }}
            style={{ width: '100%', height: 250 }}
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
              responsive: false,
              plugins: { legend: { display: false } },
              maintainAspectRatio: true,
              
            }}
            style={{ width: '100%', height: 250 }}
          />
        </Box>
      </Box>

      {/* Tableau responsive avec pagination */}
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
                  Destinataire
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
            {filteredCertls.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((certl) => (
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
        <TablePagination
          component="div"
          count={filteredCertls.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>
    </Container>
  );
};

export default CertlPage;