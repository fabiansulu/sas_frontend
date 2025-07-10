import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, TablePagination, CircularProgress, Box } from '@mui/material';
import { exportateurApi } from '../api/exportateurApi';
import { usePagination } from '../contexts/PaginationContext';

const ExportateursPage = () => {
  const [exportateurs, setExportateurs] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Utilisation du contexte pagination
  const {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    setPage
  } = usePagination();

  useEffect(() => {
    setLoading(true);
    exportateurApi.getAll({ params: { page: page + 1, page_size: rowsPerPage } }).then(res => {
      const data = res.data.results || res.data || [];
      setExportateurs(data.sort((a, b) => (a.designation || '').localeCompare(b.designation || '')));
      setCount(res.data.count || data.length);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [page, rowsPerPage]);

  // Reset page si la liste change (optionnel mais utile si tu ajoutes des filtres)
  // useEffect(() => { setPage(0); }, [/* dépendances */]);

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        SAS | Liste des Exportateurs
      </Typography>
      <Button
        variant="outlined"
        sx={{ mb: 2 }}
        onClick={() => window.open('https://cgea-sas-backend.onrender.com/api/export/exportateurs/excel/', '_blank')}
      >
        Exporter en Excel
      </Button>
      <Paper>
        {loading ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={200}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Chargement des exportateurs...</Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Désignation</TableCell>
                  <TableCell>Sigle</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Email</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exportateurs.map(exp => (
                  <TableRow key={exp.id}>
                    <TableCell>{exp.designation}</TableCell>
                    <TableCell>{exp.sigle}</TableCell>
                    <TableCell>{exp.contact}</TableCell>
                    <TableCell>{exp.email}</TableCell>
                  </TableRow>
                ))}
                {exportateurs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">Aucun exportateur trouvé.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={count}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </Paper>
    </Container>
  );
};

export default ExportateursPage;