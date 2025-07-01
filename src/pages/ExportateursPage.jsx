import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Box } from '@mui/material';
import { exportateurApi } from '../api/exportateurApi';

const ExportateursPage = () => {
  const [exportateurs, setExportateurs] = useState([]);

  useEffect(() => {
    exportateurApi.getAll().then(res => {
      setExportateurs(res.data.results || res.data || []);
    });
  }, []);

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
      </Paper>
    </Container>
  );
};

export default ExportateursPage;