import { useState, useEffect } from 'react';
import api from '../services/api';

function RegistrarMPPage() {
  const [proveedores, setProveedores] = useState([]);
  const [nombre, setNombre] = useState('');
  const [fechaIngreso, setFechaIngreso] = useState('');
  const [idProveedor, setIdProveedor] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/proveedores')
      .then(({ data }) => setProveedores(data))
      .catch(() => setError('No se pudieron cargar los proveedores'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    // Código QR simple, autogenerado (identificador único legible)
    const codigoQr = `MP-${Date.now()}`;

    try {
      const { data } = await api.post('/materia-prima', {
        nombre,
        codigo_qr: codigoQr,
        fecha_ingreso: fechaIngreso,
        id_proveedor: idProveedor,
      });
      setMensaje(`Materia prima registrada. ID: ${data.id_materia_prima} — QR: ${codigoQr}`);
      setNombre('');
      setFechaIngreso('');
      setIdProveedor('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar la materia prima');
    }
  };

  return (
    <div>
      <h2>Registrar Materia Prima</h2>
      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div>
          <label>Fecha de ingreso</label>
          <input type="date" value={fechaIngreso} onChange={(e) => setFechaIngreso(e.target.value)} required />
        </div>
        <div>
          <label>Proveedor</label>
          <select value={idProveedor} onChange={(e) => setIdProveedor(e.target.value)} required>
            <option value="">Seleccionar...</option>
            {proveedores.map((p) => (
              <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre}</option>
            ))}
          </select>
        </div>
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
}

export default RegistrarMPPage;
