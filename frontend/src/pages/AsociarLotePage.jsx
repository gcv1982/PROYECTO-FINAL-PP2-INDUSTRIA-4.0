import { useState, useEffect } from 'react';
import api from '../services/api';

function AsociarLotePage() {
  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [idMateriaPrima, setIdMateriaPrima] = useState('');
  const [idLote, setIdLote] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/materia-prima')
      .then(({ data }) => setMateriasPrimas(data.filter((mp) => mp.estado === 'disponible')))
      .catch(() => setError('No se pudieron cargar las materias primas'));
    api.get('/lotes-produccion')
      .then(({ data }) => setLotes(data))
      .catch(() => setError('No se pudieron cargar los lotes'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    try {
      await api.put(`/materia-prima/${idMateriaPrima}/asociar-lote`, {
        id_lote_produccion: idLote,
      });
      setMensaje('Materia prima asociada al lote correctamente.');
      setMateriasPrimas((prev) => prev.filter((mp) => mp.id_materia_prima !== Number(idMateriaPrima)));
      setIdMateriaPrima('');
      setIdLote('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al asociar');
    }
  };

  return (
    <div>
      <h2>Asociar Materia Prima a Lote</h2>
      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Materia prima disponible</label>
          <select value={idMateriaPrima} onChange={(e) => setIdMateriaPrima(e.target.value)} required>
            <option value="">Seleccionar...</option>
            {materiasPrimas.map((mp) => (
              <option key={mp.id_materia_prima} value={mp.id_materia_prima}>{mp.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Lote de producción</label>
          <select value={idLote} onChange={(e) => setIdLote(e.target.value)} required>
            <option value="">Seleccionar...</option>
            {lotes.map((l) => (
              <option key={l.id_lote_produccion} value={l.id_lote_produccion}>{l.codigo_lote} — {l.producto}</option>
            ))}
          </select>
        </div>
        <button type="submit">Asociar</button>
      </form>
    </div>
  );
}

export default AsociarLotePage;
