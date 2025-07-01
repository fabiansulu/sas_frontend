import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button } from '@mui/material';
import { transitaireApi } from '../api/transitaireApi';

const TransitairesPage = () => {
  const [transitaires, setTransitaires] = useState([]);

  useEffect(() => {
    transitaireApi.getAll().then(res => {
      setTransitaires(res.data.results || res.data || []);
    });
  }, []);

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
      </Paper>
    </Container>
  );
};

export default TransitairesPage;