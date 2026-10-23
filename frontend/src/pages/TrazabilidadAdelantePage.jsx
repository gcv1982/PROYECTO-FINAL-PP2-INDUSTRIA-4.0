
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../services/api';
import { formatFecha } from '../utils/formatFecha';

function TrazabilidadAdelantePage() {
  const [id, setId] = useState('');
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');

 const consultar = async (idBuscado) => {
  setError('');
  setResultado(null);
  try {
    const { data } = await api.get(`/materia-prima/${idBuscado}/trazabilidad`);
    setResultado(data);
  } catch (err) {
    setError(err.response?.data?.error || 'Error al buscar');
  }
};

const buscar = (e) => {
  e.preventDefault();
  consultar(id);
};

const descargarQR = () => {
  const canvas = document.getElementById('qr-reimpreso');
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `QR_${resultado.materia_prima.codigo_qr}.png`;
  link.click();
};

const [params] = useSearchParams();
useEffect(() => {
  const idQR = params.get('id');
  if (idQR) {
    setId(idQR);
    consultar(idQR);
  }
}, []);

  return (
    <div>
      <h2>Trazabilidad hacia adelante</h2>
      <p>Dado un lote de materia prima, ver en qué lote de helado fue utilizado.</p>
      <form onSubmit={buscar}>
        <input
          type="number"
          placeholder="ID de materia prima"
          value={id}
          onChange={(e) => setId(e.target.value)}
          required
        />
        <button type="submit">Buscar</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {resultado && (
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div>
            <h3>Materia Prima</h3>
            <p>{resultado.materia_prima.nombre} — Estado: {resultado.materia_prima.estado}</p>
            <p>Proveedor: {resultado.materia_prima.proveedor.nombre} — QR: {resultado.materia_prima.codigo_qr}</p>
            <h3>Lote de producción</h3>
            {resultado.lote ? (
              <p>{resultado.lote.codigo_lote} — {resultado.lote.producto} ({formatFecha(resultado.lote.fecha_produccion)})</p>
            ) : (
              <p>Todavía no fue asociada a ningún lote de producción.</p>
            )}
          </div>

          <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', padding: '1.5rem 2rem', textAlign: 'center' }}>
            <h3>Etiqueta QR – {resultado.materia_prima.codigo_qr}</h3>
            <QRCodeCanvas
              id="qr-reimpreso"
              value={`${import.meta.env.VITE_APP_URL}/trazabilidad/adelante?id=${resultado.materia_prima.id_materia_prima}`}
              size={200}
              includeMargin
            />
            <div style={{ marginTop: '1rem' }}><button onClick={descargarQR}>Reimprimir etiqueta</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrazabilidadAdelantePage;
