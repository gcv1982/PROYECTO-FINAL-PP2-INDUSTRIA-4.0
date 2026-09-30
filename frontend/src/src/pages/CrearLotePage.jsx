import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function CrearLotePage() {
  const { usuario } = useAuth();
  const [codigoLote, setCodigoLote] = useState('');
  const [fechaProduccion, setFechaProduccion] = useState('');
  const [producto, setProducto] = useState('');
  const [cantidadProducida, setCantidadProducida] = useState('');
  const [unidadMedida, setUnidadMedida] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    try {
      const { data } = await api.post('/lotes-produccion', {
        codigo_lote: codigoLote,
        fecha_produccion: fechaProduccion,
        producto,
        cantidad_producida: cantidadProducida || null,
        unidad_medida: unidadMedida || null,
        id_usuario_responsable: usuario.id_usuario,
      });
      setMensaje(`Lote creado. ID: ${data.id_lote_produccion} — Código: ${data.codigo_lote}`);
      setCodigoLote('');
      setFechaProduccion('');
      setProducto('');
      setCantidadProducida('');
      setUnidadMedida('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el lote');
    }
  };

  return (
    <div>
      <h2>Crear Lote de Producción</h2>
      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Código de lote</label>
          <input value={codigoLote} onChange={(e) => setCodigoLote(e.target.value)} required />
        </div>
        <div>
          <label>Producto</label>
          <input value={producto} onChange={(e) => setProducto(e.target.value)} required />
        </div>
        <div>
          <label>Fecha de producción</label>
          <input type="date" value={fechaProduccion} onChange={(e) => setFechaProduccion(e.target.value)} required />
        </div>
        <div>
          <label>Cantidad producida (opcional)</label>
          <input type="number" value={cantidadProducida} onChange={(e) => setCantidadProducida(e.target.value)} />
        </div>
        <div>
          <label>Unidad de medida (opcional)</label>
          <input value={unidadMedida} onChange={(e) => setUnidadMedida(e.target.value)} placeholder="kg, litros, unidades..." />
        </div>
        <button type="submit">Crear lote</button>
      </form>
    </div>
  );
}

export default CrearLotePage;
