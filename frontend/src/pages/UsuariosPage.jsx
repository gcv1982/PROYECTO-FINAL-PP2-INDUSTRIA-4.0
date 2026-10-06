import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ROLES = ['calidad', 'logistica', 'supervision'];

function UsuariosPage() {
  const { usuario: usuarioActual } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('calidad');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const cargarUsuarios = () => {
    api.get('/usuarios')
      .then(({ data }) => setUsuarios(data))
      .catch(() => setError('No se pudieron cargar los usuarios'));
  };

  useEffect(cargarUsuarios, []);

  const limpiarForm = () => {
    setEditandoId(null);
    setNombre('');
    setEmail('');
    setPassword('');
    setRol('calidad');
  };

  const editar = (u) => {
    setEditandoId(u.id_usuario);
    setNombre(u.nombre);
    setEmail(u.email);
    setPassword('');
    setRol(u.rol);
    setMensaje('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    try {
      if (editandoId) {
        await api.put(`/usuarios/${editandoId}`, { nombre, email, rol });
        setMensaje('Usuario actualizado correctamente.');
      } else {
        await api.post('/usuarios', { nombre, email, password, rol });
        setMensaje('Usuario creado correctamente.');
      }
      limpiarForm();
      cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el usuario');
    }
  };

  const darDeBaja = async (u) => {
    setError('');
    setMensaje('');
    try {
      await api.delete(`/usuarios/${u.id_usuario}`);
      setMensaje(`Usuario "${u.nombre}" dado de baja.`);
      if (editandoId === u.id_usuario) limpiarForm();
      cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al dar de baja el usuario');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <h2>Gestión de Usuarios</h2>
      <p>Alta, edición y baja de usuarios del sistema. Solo Supervisión puede acceder a esta pantalla.</p>
      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ margin: 0 }}>
        <h3 style={{ marginTop: 0 }}>{editandoId ? 'Editar usuario' : 'Nuevo usuario'}</h3>
        <div>
          <label>Nombre</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        {!editandoId && (
          <div>
            <label>Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
        )}
        <div>
          <label>Rol</label>
          <select value={rol} onChange={(e) => setRol(e.target.value)} required>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <button type="submit">{editandoId ? 'Guardar cambios' : 'Crear usuario'}</button>
        {editandoId && (
          <button type="button" onClick={limpiarForm} style={{ marginLeft: '0.5rem' }}>Cancelar</button>
        )}
      </form>

      <h3>Usuarios activos</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
            <th style={{ padding: '0.5rem' }}>Nombre</th>
            <th style={{ padding: '0.5rem' }}>Email</th>
            <th style={{ padding: '0.5rem' }}>Rol</th>
            <th style={{ padding: '0.5rem' }}></th>
          </tr>
        </thead>
        <tbody>
          {usuarios.filter((u) => u.activo).map((u) => (
            <tr key={u.id_usuario} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.5rem' }}>{u.nombre}</td>
              <td style={{ padding: '0.5rem' }}>{u.email}</td>
              <td style={{ padding: '0.5rem' }}>{u.rol}</td>
              <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                <button type="button" onClick={() => editar(u)}>Editar</button>{' '}
                <button
                  type="button"
                  onClick={() => darDeBaja(u)}
                  disabled={u.id_usuario === usuarioActual.id_usuario}
                  title={u.id_usuario === usuarioActual.id_usuario ? 'No podés darte de baja a vos mismo' : ''}
                >
                  Dar de baja
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsuariosPage;
