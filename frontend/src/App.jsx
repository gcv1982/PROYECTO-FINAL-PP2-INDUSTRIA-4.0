import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import RutaProtegida from './components/RutaProtegida';
import Navbar from './components/Navbar';

import LoginPage from './pages/LoginPage';
import SinPermisoPage from './pages/SinPermisoPage';
import RegistrarMPPage from './pages/RegistrarMPPage';
import CrearLotePage from './pages/CrearLotePage';
import AsociarLotePage from './pages/AsociarLotePage';
import TrazabilidadAdelantePage from './pages/TrazabilidadAdelantePage';
import TrazabilidadAtrasPage from './pages/TrazabilidadAtrasPage';
import UsuariosPage from './pages/UsuariosPage';

function HomeRedirect() {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  return <Navigate to="/trazabilidad/adelante" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sin-permiso" element={<SinPermisoPage />} />

        <Route path="/" element={<HomeRedirect />} />

        <Route
          path="/materia-prima/nueva"
          element={
            <RutaProtegida rolesPermitidos={['calidad', 'supervision']}>
              <RegistrarMPPage />
            </RutaProtegida>
          }
        />

        <Route
          path="/lote/nuevo"
          element={
            <RutaProtegida rolesPermitidos={['logistica', 'supervision']}>
              <CrearLotePage />
            </RutaProtegida>
          }
        />

        <Route
          path="/lote/asociar"
          element={
            <RutaProtegida rolesPermitidos={['logistica', 'supervision']}>
              <AsociarLotePage />
            </RutaProtegida>
          }
        />

        <Route
          path="/trazabilidad/adelante"
          element={
            <RutaProtegida rolesPermitidos={['calidad', 'logistica', 'supervision']}>
              <TrazabilidadAdelantePage />
            </RutaProtegida>
          }
        />

        <Route
          path="/trazabilidad/atras"
          element={
            <RutaProtegida rolesPermitidos={['calidad', 'logistica', 'supervision']}>
              <TrazabilidadAtrasPage />
            </RutaProtegida>
          }
        />

        <Route
          path="/usuarios"
          element={
            <RutaProtegida rolesPermitidos={['supervision']}>
              <UsuariosPage />
            </RutaProtegida>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
