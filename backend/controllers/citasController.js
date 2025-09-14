// controllers/citasController.js

const connection = require('../config/db');

exports.registrarCita = (req, res) => {
  const { id_paciente, fecha_cita, hora, id_motivo, id_usuario, estado } = req.body;

  if (!id_usuario || !id_paciente || !fecha_cita || !hora || !id_motivo) {
    return res.status(400).json({ error: 'Campos incompletos' });
  }

  const sql = `
    INSERT INTO citaseguimiento (id_paciente, fecha_cita, hora, id_motivo, id_usuario, estado)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  connection.query(sql, [id_paciente, fecha_cita, hora, id_motivo, id_usuario, estado], (err, result) => {
    if (err) {
      console.error('Error al registrar cita:', err);
      return res.status(500).json({ error: 'Error al registrar cita' });
    }
    res.status(201).json({ mensaje: 'Cita registrada correctamente' });
  });
};

// Obtener todas las citas con nombre del paciente y motivo
exports.obtenerCitas = (req, res) => {
  const sql = `
  SELECT 
    c.id_cita,
    DATE_FORMAT(c.fecha_cita, '%Y-%m-%d') AS fecha_cita,
    c.hora,
    c.estado,
    p.nombre AS nombre_paciente,
    m.nombre AS motivo
    FROM citaseguimiento c
    JOIN paciente p ON c.id_paciente = p.id_paciente
    JOIN motivos_cita m ON c.id_motivo = m.id_motivo;
`;



  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener citas:', err);
      return res.status(500).json({ error: 'Error al obtener citas' });
    }
    res.json(results);
  });
};

// Actualizar estado de una cita
exports.actualizarEstado = (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!['Pendiente', 'Realizada', 'Cancelada'].includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  const sql = `UPDATE citaseguimiento SET estado = ? WHERE id_cita = ?`;
  connection.query(sql, [estado, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar estado:', err);
      return res.status(500).json({ error: 'Error al actualizar estado de la cita' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    res.json({ mensaje: 'Estado actualizado correctamente' });
  });
};
