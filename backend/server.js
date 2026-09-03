const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

// Rutas
const proveedorRoutes = require('./routes/proveedorRoutes');
const materiaPrimaRoutes = require('./routes/materiaPrimaRoutes');
const loteProduccionRoutes = require('./routes/loteProduccionRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

app.use('/api/proveedores', proveedorRoutes);
app.use('/api/materia-prima', materiaPrimaRoutes);
app.use('/api/lotes-produccion', loteProduccionRoutes);
app.use('/api/usuarios', usuarioRoutes);

app.get('/', (req, res) => {
  res.json({ mensaje: 'API Trazabilidad Helaspi - Semana 3' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
