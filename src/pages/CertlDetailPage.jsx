import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Paper, Stack } from '@mui/material';
import { certlApi } from '../api/certlApi';

const CertlDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certl, setCertl] = useState(null);

  useEffect(() => {
    const fetchCertl = async () => {
      try {
        const response = await certlApi.getById(id);
        setCertl(response.data);
      } catch (error) {
        console.error('Error fetching CERTL:', error);
      }
    };
    fetchCertl();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce CERTL ?')) return;
    try {
      await certlApi.delete(id);
      navigate('/certl');
    } catch (error) {
      alert("Suppression impossible, ce CERTL est peut-être lié à d'autres données.");
      console.error('Error deleting CERTL:', error);
    }
  };

  if (!certl) return <div>Loading...</div>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Détails du CERTL N° {certl.numero_certificat}
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <Typography><strong>Emis le:</strong> {certl.date_emission}</Typography>
          <Typography><strong>Opérateur minier:</strong> {certl.operateur_minier?.designation}</Typography>
          <Typography><strong>Destinateur:</strong> {certl.destinateur?.designation}</Typography>
          <Typography><strong>Origine:</strong> {certl.origine}</Typography>
          <Typography><strong>Produit:</strong> {certl.produit?.designation}</Typography>
          <Typography><strong>Poids:</strong> {certl.poids} tonnes</Typography>
          <Typography><strong>Taux:</strong> {certl.taux_radioactivite} ms</Typography>
          <Typography><strong>Emis à:</strong> {certl.emis_a?.poste}</Typography>
        </Stack>
      </Paper>
      <Typography>
        <strong>Scan:</strong>{" "}
        {certl.scan ? (
          <a 
            href={
              certl.scan.startsWith('http') 
              ? certl.scan 
              : `https://cgea-sas-backend.onrender.com${certl.scan}`
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
          onClick={() => navigate(`/certl/${id}/edit`)}
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
      </Stack>
    </Container>
  );
};

export default CertlDetailPage;