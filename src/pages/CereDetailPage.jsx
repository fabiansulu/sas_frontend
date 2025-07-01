import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Paper, Stack } from '@mui/material';
import { cereApi } from '../api/cereApi';
//import { ReactToPrint } from 'react-to-print';

const CereDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cere, setCere] = useState(null);
  //const detailRef = useRef();

  useEffect(() => {
    const fetchCere = async () => {
      try {
        const response = await cereApi.getById(id);
        setCere(response.data);
      } catch (error) {
        console.error('Error fetching CERE:', error);
      }
    };
    fetchCere();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce CERE ?')) return;
    try {
      await cereApi.delete(id);
      navigate('/cere');
    } catch (error) {
      alert("Suppression impossible, ce CERE est peut-être lié à d'autres données.");
      console.error('Error deleting CERE:', error);
    }
  };

  if (!cere) return <div>Loading...</div>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Détails du CERE N° {cere.numero_cere}
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <Typography><strong>Emis le:</strong> {cere.date_emission}</Typography>
          <Typography><strong>Exportateur:</strong> {cere.exportateur?.designation}</Typography>
          <Typography><strong>Transitaire:</strong> {cere.transitaire?.designation}</Typography>
          <Typography><strong>Poids:</strong> {cere.poids} tonnes</Typography>
          <Typography><strong>Produit:</strong> {cere.produit?.designation}</Typography>
          <Typography><strong>Taux:</strong> {cere.taux_radioactivite} ms</Typography>
          <Typography><strong>Scan:</strong> {cere.scan}</Typography>
          <Typography><strong>Emis à:</strong> {cere.emis_a?.poste}</Typography>
          
        </Stack>
      </Paper>
      <Typography>
        <strong>Scan:</strong>{" "}
        {cere.scan ? (
          <a 
            href={
              cere.scan.startsWith('http') 
              ? cere.scan 
              : `https://cgea-sas-backend.onrender.com${cere.scan}`
            }
            target="_blank" 
            rel="noopener noreferrer"
          >
            Voir le certificat
          </a>
        ) : (
          "Aucun fichier"
        )}
      </Typography>
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/cere/${id}/edit`)}
        >
          Modifier
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
        >
          Supprimer
        </Button>
        {/* <ReactToPrint
          trigger={() => (
            <Button variant="contained" color="secondary">
              Imprimer
            </Button>
          )}
          content={() => detailRef.current}
        /> */}
        {/* 
        <Button
          variant="outlined"
          onClick={handleExportPDF}
        >
          Exporter en PDF
        </Button>
        */}
      </Stack>
    </Container>
  );
};

export default CereDetailPage;