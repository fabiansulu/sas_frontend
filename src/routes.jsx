import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CerePage from './pages/CerePage';
import CertlPage from './pages/CertlPage';
import HomePage from './pages/HomePage';
import CereCreatePage from './pages/CereCreatePage';
import CereDetailPage from './pages/CereDetailPage';
import CereEditPage from './pages/CereEditPage';
import CertlCreatePage from './pages/CertlCreatePage';
import CertlDetailPage from './pages/CertlDetailPage';
import CertlEditPage from './pages/CertlEditPage';

import Layout from './components/Layout';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import { ErrorBoundary } from './components/ErrorBoundary';

import ExportateursPage from './pages/ExportateursPage';
import TransitairesPage from './pages/TransitairesPage';
import ProduitsPage from './pages/ProduitsPage';
import PostesPage from './pages/PostesPage';

const PrivateRoute = ({ children}) => {
  const { user, loading } = useAuth();

  if (loading){
    return <div>Chargement...</div>;
  }
  if (!user){
    return <Navigate to="/login" replace />  
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
};


const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/*" 
          element={
            <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/cere" element={<PrivateRoute><CerePage /></PrivateRoute>} />
              <Route path="/cere/create" element={<PrivateRoute><CereCreatePage /></PrivateRoute>} />
              <Route path="/cere/:id" element={<PrivateRoute><CereDetailPage /></PrivateRoute>} />
              <Route path="/cere/:id/edit" element={<PrivateRoute><CereEditPage /></PrivateRoute>} />
              
              <Route path="/certl" element={<PrivateRoute><CertlPage /></PrivateRoute>} />
              <Route path="/certl/create" element={<PrivateRoute><CertlCreatePage /></PrivateRoute>} />
              <Route path="/certl/:id" element={<PrivateRoute><CertlDetailPage /></PrivateRoute>} />
              <Route path="/certl/:id/edit" element={<PrivateRoute><CertlEditPage /></PrivateRoute>} />
             
              <Route path="/exportateurs" element={<PrivateRoute><ExportateursPage /></PrivateRoute>} />
              <Route path="/transitaires" element={<PrivateRoute><TransitairesPage /></PrivateRoute>} />
              <Route path="/produits" element={<PrivateRoute><ProduitsPage /></PrivateRoute>} />
              <Route path="/postes" element={<PrivateRoute><PostesPage /></PrivateRoute>} />
            </Routes>
          </Layout>
          }
      />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;