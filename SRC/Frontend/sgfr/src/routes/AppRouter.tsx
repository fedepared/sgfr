import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout';
import { ProtectedRoute } from '../components/common';
import { HomePage, LoginPage, VehiclesPage, NotFoundPage } from '../pages';
import { ROUTES } from '../constants/routes.constant';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública de login */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />

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
