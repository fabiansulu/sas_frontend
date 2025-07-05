import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import AppRoutes from './routes';

//création d'un theme MUI de base
const theme = createTheme();

function App(){
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <AppRoutes/>
    </ThemeProvider>
  );
}

export default App;


