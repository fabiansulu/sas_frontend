import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, TablePagination, CircularProgress, Box } from '@mui/material';
import { posteApi } from '../api/posteApi';

const PostesPage = () => {
  const [postes, setPostes] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    posteApi.getAll({ params: { page: page + 1, page_size: rowsPerPage } }).then(res => {
      const data = res.data.results || res.data || [];
      setPostes(data.sort((a, b) => (a.site || '').localeCompare(b.site || '')));
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
        SAS | Liste des Postes
      </Typography>
      <Button
        variant="outlined"
        sx={{ mb: 2 }}
        onClick={() => window.open('https://cgea-sas-backend.onrender.com/api/export/postes/excel/', '_blank')}
      >
        Exporter en Excel
      </Button>
      <Paper>
        {loading ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={200}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Chargement des postes...</Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Site</TableCell>
                  <TableCell>Poste</TableCell>
                  <TableCell>Ville</TableCell>
                  <TableCell>Antenne</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {postes.map(pos => (
                  <TableRow key={pos.id}>
                    <TableCell>{pos.site}</TableCell>
                    <TableCell>{pos.poste}</TableCell>
                    <TableCell>{pos.ville}</TableCell>
                    <TableCell>{pos.antenne}</TableCell>
                  </TableRow>
                ))}
                {postes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">Aucun poste trouvé.</TableCell>
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

export default PostesPage;