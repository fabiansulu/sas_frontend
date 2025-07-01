import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button } from '@mui/material';
import { produitApi } from '../api/produitApi';

const ProduitsPage = () => {
  const [produits, setProduits] = useState([]);

  useEffect(() => {
    produitApi.getAll().then(res => {
      setProduits(res.data.results || res.data || []);
    });
  }, []);

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
      </Paper>
    </Container>
  );
};

export default ProduitsPage;