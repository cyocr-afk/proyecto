// controllers/motivosController.js

const connection = require('../config/db');

exports.obtenerMotivos = (req, res) => {
  connection.query('SELECT * FROM motivos_cita', (err, results) => {
    if (err) {
      console.error('Error al obtener motivos:', err);
      return res.status(500).json({ error: 'Error al obtener motivos' });
    }
    res.json(results);
  });
};
