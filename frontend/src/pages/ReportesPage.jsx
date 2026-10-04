import { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import api from '../services/api';

const COLORES = ['#24344d', '#3a5a8c', '#6f9bd1', '#9fc1e6', '#b9c9dd'];

function ReportesPage() {
  const [proveedores, setProveedores] = useState([]);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    api.get('/proveedores')
      .then(({ data }) => setProveedores(data))
      .catch(() => {});
    buscar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buscar = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (desde && hasta && desde > hasta) {
      setError('La fecha "desde" no puede ser posterior a "hasta"');
      return;
    }

    setCargando(true);
    try {
      const { data } = await api.get('/reportes/resumen', {
        params: {
          desde: desde || undefined,
          hasta: hasta || undefined,
          proveedor: proveedor || undefined,
        },
      });
      setResumen(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al obtener el resumen');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <h2>Tablero de KPIs</h2>
      <p>Resumen de materia prima y lotes de producción, con filtro por período y proveedor.</p>

      <form onSubmit={buscar} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap', background: '#fff', padding: '1rem 1.5rem', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
        <div>
          <label>Desde</label><br />
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div>
          <label>Hasta</label><br />
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        <div>
          <label>Proveedor</label><br />
          <select value={proveedor} onChange={(e) => setProveedor(e.target.value)}>
            <option value="">Todos</option>
            {proveedores.map((p) => (
              <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={cargando}>{cargando ? 'Buscando...' : 'Aplicar filtros'}</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {resumen && (
        <>
          <div style={{ margin: '1.5rem 0', background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <h3 style={{ margin: 0 }}>Materia prima registrada en el período</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#24344d', margin: '0.3rem 0 0' }}>{resumen.mp_registradas}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <h3>Materia prima por proveedor</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={resumen.mp_por_proveedor}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="proveedor" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#3a5a8c" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <h3>Lotes por estado</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={resumen.lotes_por_estado} dataKey="total" nameKey="estado" cx="50%" cy="50%" outerRadius={90} label>
                    {resumen.lotes_por_estado.map((entry, i) => (
                      <Cell key={entry.estado} fill={COLORES[i % COLORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', gridColumn: '1 / -1' }}>
              <h3>Materia prima: utilizada vs. disponible</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={resumen.mp_por_estado} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="estado" width={100} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#6f9bd1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ReportesPage;
