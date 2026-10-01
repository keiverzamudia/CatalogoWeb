import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CatalogoPage } from './pages/CatalogoPage';

/**
 * El panel administrativo se carga bajo demanda: el visitante del QR nunca
 * descarga el bundle del admin. Ademas no existe ningun enlace, boton ni menu
 * publico que lo mencione (requisito del brief).
 */
const AdminApp = lazy(() =>
  import('./pages/admin/AdminApp').then((m) => ({ default: m.AdminApp })),
);

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CatalogoPage />} />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={null}>
              <AdminApp />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}