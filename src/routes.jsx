import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import LoginPage from './pages/LoginPage';
import { ErrorBoundary } from './components/ErrorBoundary';

import ExportateursPage from './pages/ExportateursPage';
import TransitairesPage from './pages/TransitairesPage';
import ProduitsPage from './pages/ProduitsPage';
import PostesPage from './pages/PostesPage';

import RequireAuth from './components/RequireAuth';

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
                <Route path="/cere" element={<RequireAuth><CerePage /></RequireAuth>} />
                <Route path="/cere/create" element={<RequireAuth><CereCreatePage /></RequireAuth>} />
                <Route path="/cere/:id" element={<RequireAuth><CereDetailPage /></RequireAuth>} />
                <Route path="/cere/:id/edit" element={<RequireAuth><CereEditPage /></RequireAuth>} />
                
                <Route path="/certl" element={<RequireAuth><CertlPage /></RequireAuth>} />
                <Route path="/certl/create" element={<RequireAuth><CertlCreatePage /></RequireAuth>} />
                <Route path="/certl/:id" element={<RequireAuth><CertlDetailPage /></RequireAuth>} />
                <Route path="/certl/:id/edit" element={<RequireAuth><CertlEditPage /></RequireAuth>} />
               
                <Route path="/exportateurs" element={<RequireAuth><ExportateursPage /></RequireAuth>} />
                <Route path="/transitaires" element={<RequireAuth><TransitairesPage /></RequireAuth>} />
                <Route path="/produits" element={<RequireAuth><ProduitsPage /></RequireAuth>} />
                <Route path="/postes" element={<RequireAuth><PostesPage /></RequireAuth>} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;