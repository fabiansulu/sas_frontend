import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, TablePagination, CircularProgress, Box } from '@mui/material';
import { transitaireApi } from '../api/transitaireApi';

const TransitairesPage = () => {
  const [transitaires, setTransitaires] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    transitaireApi.getAll({ params: { page: page + 1, page_size: rowsPerPage } }).then(res => {
      const data = res.data.results || res.data || [];
      setTransitaires(data.sort((a, b) => (a.designation || '').localeCompare(b.designation || '')));
      setCount(res.data.count || data.length);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        SAS | Liste des Transitaires
      </Typography>
      <Button
        variant="outlined"
        sx={{ mb: 2 }}
        onClick={() => window.open('https://cgea-sas-backend.onrender.com/api/export/transitaires/excel/', '_blank')}
      >
        Exporter en Excel
      </Button>
      <Paper>
        {loading ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={200}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Chargement des transitaires...</Typography>
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
                {transitaires.map(tra => (
                  <TableRow key={tra.id}>
                    <TableCell>{tra.designation}</TableCell>
                    <TableCell>{tra.sigle}</TableCell>
                    <TableCell>{tra.contact}</TableCell>
                    <TableCell>{tra.email}</TableCell>
                  </TableRow>
                ))}
                {transitaires.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">Aucun transitaire trouvé.</TableCell>
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

export default TransitairesPage;