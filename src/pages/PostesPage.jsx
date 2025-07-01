import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button } from '@mui/material';
import { posteApi } from '../api/posteApi';

const PostesPage = () => {
  const [postes, setPostes] = useState([]);

  useEffect(() => {
    posteApi.getAll().then(res => {
      setPostes(res.data.results || res.data || []);
    });
  }, []);

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
      </Paper>
    </Container>
  );
};

export default PostesPage;