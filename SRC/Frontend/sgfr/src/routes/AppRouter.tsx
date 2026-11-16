import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout';
import { ProtectedRoute } from '../components/common';
import { HomePage, LoginPage, VehiclesPage, AboutPage, NotFoundPage } from '../pages';
import { ROUTES } from '../constants/routes.constant';
import { useAuth } from '../hooks';

/**
 * Componente que renderiza AboutPage dentro de MainLayout si el usuario está autenticado,
 * o en un contenedor público estilizado y centrado si el usuario no ha iniciado sesión.
 */
const AboutRouteWrapper: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <MainLayout />
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8f9fa',
        padding: '24px 16px',
      }}
    >
      <div
        style={{
          maxWidth: 1040,
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f0f0f0',
        }}
      >
        <AboutPage />
      </div>
    </div>
  );
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública de login */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />

        {/* Ruta accesible pública y privadamente */}
        <Route path={ROUTES.ABOUT} element={<AboutRouteWrapper />}>
          <Route index element={<AboutPage />} />
        </Route>

        {/* Rutas protegidas que requieren autenticación */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.VEHICLES} element={<VehiclesPage />} />
          </Route>
        </Route>

        {/* Ruta 404 */}
        <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </BrowserRouter>
  );
};
