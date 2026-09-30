import { useState } from 'react';
import api from '../services/api';

function TrazabilidadAtrasPage() {
  const [id, setId] = useState('');
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');

  const buscar = async (e) => {
    e.preventDefault();
    setError('');
    setResultado(null);
    try {
      const { data } = await api.get(`/lotes-produccion/${id}/trazabilidad`);
      setResultado(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al buscar');
    }
  };

  return (
    <div>
      <h2>Trazabilidad hacia atrás</h2>
      <p>Dado un lote de helado, ver qué materias primas lo componen.</p>
      <form onSubmit={buscar}>
        <input
          type="number"
          placeholder="ID de lote de producción"
          value={id}
          onChange={(e) => setId(e.target.value)}
          required
        />
        <button type="submit">Buscar</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {resultado && (
        <div>
          <h3>Lote</h3>
          <p>{resultado.lote.codigo_lote} — {resultado.lote.producto}</p>
          <h3>Materias primas utilizadas</h3>
          {resultado.materias_primas.length > 0 ? (
            <ul>
              {resultado.materias_primas.map((mp) => (
                <li key={mp.id_materia_prima}>{mp.nombre} (id: {mp.id_materia_prima})</li>
              ))}
            </ul>
          ) : (
            <p>Este lote no tiene materias primas asociadas todavía.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default TrazabilidadAtrasPage;
