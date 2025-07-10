import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import AppRoutes from './routes';
import { PaginationProvider } from './contexts/PaginationContext';

// Création d'un thème MUI de base
const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PaginationProvider>
        <AppRoutes />
      </PaginationProvider>
    </ThemeProvider>
  );
}

export default App;