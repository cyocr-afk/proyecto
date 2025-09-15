// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initPool } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Inicia primero el pool y luego monta rutas
(async () => {
  try {
    const pool = await initPool();
    // comparte el pool con tus rutas via req.pool (middleware)
    app.use((req, _res, next) => { req.db = pool; next(); });

    // Rutas (después de inyectar req.db)
    app.use('/api', require('./routes/authRoutes'));
    app.use('/api/usuarios', require('./routes/usuarios'));
    app.use('/api', require('./routes/PacienteRoutes'));
    app.use('/api', require('./routes/controles'));
    app.use('/api', require('./routes/riesgos'));
    app.use('/api/pacientes', require('./routes/pacientes'));
    app.use('/api/alertas', require('./routes/alerta'));
    app.use('/api/citas', require('./routes/citas'));
    app.use('/api/motivos', require('./routes/motivos'));
    app.use('/api/historialpaciente', require('./routes/historialPaciente'));
    app.use('/api/reportes', require('./routes/reportes'));

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (e) {
    console.error('No pude iniciar DB:', e);
    process.exit(1);
  }
})();
