// src/components/Loader.jsx
import { Box, CircularProgress, Typography } from '@mui/material';

const Loader = ({ text = "Chargement..." }) => (
  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={200}>
    <CircularProgress sx={{ mb: 2 }} />
    <Typography>{text}</Typography>
  </Box>
);

export default Loader;