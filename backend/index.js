// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initPool } = require('./db'); // << usa el pool único

const app = express();
app.use(cors());
app.use(express.json());

(async () => {
  try {
    // Inicializa la DB antes de montar rutas/levantar server
    const pool = await initPool();

    // Inyecta el pool en cada request (acceso como req.db)
    app.use((req, _res, next) => { req.db = pool; next(); });

    // --- Rutas ---
    app.use('/api', require('./routes/authRoutes'));         // registro/login
    app.use('/api/usuarios', require('./routes/usuarios'));  // registro usuarios
    app.use('/api', require('./routes/PacienteRoutes'));     // registro paciente
    app.use('/api', require('./routes/controles'));          // registro controles
    app.use('/api', require('./routes/riesgos'));
    app.use('/api/pacientes', require('./routes/pacientes')); // conteo controles
    app.use('/api/alertas', require('./routes/alerta'));
    app.use('/api/citas', require('./routes/citas'));
    app.use('/api/motivos', require('./routes/motivos'));
    app.use('/api/historialpaciente', require('./routes/historialPaciente'));
    app.use('/api/reportes', require('./routes/reportes'));

    // Healthcheck simple para Render
    app.get('/health', (_req, res) => res.json({ ok: true }));

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (e) {
    console.error('No pude iniciar DB:', e);
    process.exit(1);
  }
})();
