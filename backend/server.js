const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
const authRoutes = require('./routes/authRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');
const materiaPrimaRoutes = require('./routes/materiaPrimaRoutes');
const loteProduccionRoutes = require('./routes/loteProduccionRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/materia-prima', materiaPrimaRoutes);
app.use('/api/lotes-produccion', loteProduccionRoutes);
app.use('/api/usuarios', usuarioRoutes);

app.get('/', (req, res) => {
  res.json({ mensaje: 'API Trazabilidad Helaspi - Semana 4 (Auth + CRUD completo)' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
