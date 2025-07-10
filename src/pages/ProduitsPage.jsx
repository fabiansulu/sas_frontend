import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, TablePagination, CircularProgress, Box } from '@mui/material';
import { produitApi } from '../api/produitApi';
import { usePagination } from '../contexts/PaginationContext';

const ProduitsPage = () => {
  const [produits, setProduits] = useState([]);
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
    produitApi.getAll({ params: { page: page + 1, page_size: rowsPerPage } }).then(res => {
      const data = res.data.results || res.data || [];
      setProduits(data.sort((a, b) => (a.designation || '').localeCompare(b.designation || '')));
      setCount(res.data.count || data.length);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [page, rowsPerPage]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        SAS | Liste des Produits
      </Typography>
      <Button
        variant="outlined"
        sx={{ mb: 2 }}
        onClick={() => window.open('https://cgea-sas-backend.onrender.com/api/export/produits/excel/', '_blank')}
      >
        Exporter en Excel
      </Button>
      <Paper>
        {loading ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={200}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Chargement des produits...</Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Désignation</TableCell>
                  <TableCell>Abbréviation</TableCell>
                  <TableCell>Taux Maximum</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {produits.map(prod => (
                  <TableRow key={prod.id}>
                    <TableCell>{prod.designation}</TableCell>
                    <TableCell>{prod.abbreviation}</TableCell>
                    <TableCell>{prod.taux_maximum}</TableCell>
                    <TableCell>{prod.notes}</TableCell>
                  </TableRow>
                ))}
                {produits.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">Aucun produit trouvé.</TableCell>
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

export default ProduitsPage;