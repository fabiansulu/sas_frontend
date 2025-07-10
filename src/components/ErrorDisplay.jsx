// src/components/ErrorDisplay.jsx
import { Alert, Box } from '@mui/material';

const ErrorDisplay = ({ error }) => (
  <Box my={2}>
    <Alert severity="error">{error}</Alert>
  </Box>
);

export default ErrorDisplay;