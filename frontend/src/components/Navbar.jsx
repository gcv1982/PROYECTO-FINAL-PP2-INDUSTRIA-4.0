import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  if (!usuario) return null;

  const salir = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <Link to="/trazabilidad/adelante">Trazabilidad adelante</Link>
      <Link to="/trazabilidad/atras">Trazabilidad atrás</Link>
      <Link to="/materia-prima/nueva">Registrar MP</Link>
      <Link to="/lote/nuevo">Crear lote</Link>
      <Link to="/lote/asociar">Asociar a lote</Link>
      <Link to="/reportes">Reportes</Link>
      {usuario.rol === 'supervision' && <Link to="/usuarios">Usuarios</Link>}
      <span style={{ marginLeft: 'auto' }}>
        {usuario.nombre} ({usuario.rol})
      </span>
      <button onClick={salir}>Salir</button>
    </nav>
  );
}

export default Navbar;
