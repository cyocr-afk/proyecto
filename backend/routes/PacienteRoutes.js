const express = require('express'); 
const router = express.Router();
const connection = require('../config/db');

// Registrar paciente
router.post('/pacientes', (req, res) => {
  const {
    nombre,
    dpi,
    fecha_nacimiento,
    direccion,
    telefono,
    estado_civil,
    escolaridad,
    ocupacion,
    pueblo
  } = req.body;

  const dpiValido = /^\d{13}$/.test(dpi);
  if (!dpiValido) {
    return res.status(400).json({ error: 'El DPI/CUI es inválido (debe contener 13 dígitos numéricos).' });
  }

  const fecha_registro = new Date().toISOString().split('T')[0];

  const sql = `
    INSERT INTO paciente (
      nombre, dpi, fecha_nacimiento, direccion, telefono,
      estado_civil, escolaridad, ocupacion, pueblo, fecha_registro
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    nombre,
    dpi,
    fecha_nacimiento,
    direccion || null,
    telefono || null,
    estado_civil,
    escolaridad || null,
    ocupacion || null,
    pueblo,
    fecha_registro
  ];

  connection.query(sql, params, (err, result) => {
    if (err) {
      console.error('Error al registrar paciente:', err);
      return res.status(500).send('Error al registrar paciente');
    }
    res.status(201).json({ ok: true, id_paciente: result.insertId });
  });
});

// Obtener lista de pacientes (con filtro por nombre)
router.get('/pacientes', (req, res) => {
  const nombre = req.query.nombre;
  
  let sql = 'SELECT id_paciente, nombre, dpi, fecha_nacimiento, direccion, telefono, estado_civil FROM paciente';
  const params = [];

  if (nombre) {
    sql += ' WHERE nombre LIKE ?';
    params.push(`%${nombre}%`);
  }

  sql += ' ORDER BY nombre ASC';

  connection.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error al obtener pacientes:', err);
      return res.status(500).json({ error: 'Error al obtener pacientes' });
    }
    res.json(results);
  });
});

// 🔍 Búsqueda interactiva por nombre o DPI 
router.get('/pacientes/buscar', (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({ error: 'El parámetro de búsqueda es requerido.' });
  }

  const sql = `
    SELECT id_paciente, nombre, dpi, fecha_nacimiento, direccion, telefono, estado_civil
    FROM paciente
    WHERE nombre LIKE ? OR dpi LIKE ?
    ORDER BY nombre ASC
  `;
  const valor = `%${query}%`;

  connection.query(sql, [valor, valor], (err, results) => {
    if (err) {
      console.error('Error en búsqueda de pacientes:', err);
      return res.status(500).json({ error: 'Error al buscar pacientes' });
    }
    res.json(results);
  });
});

module.exports = router;
