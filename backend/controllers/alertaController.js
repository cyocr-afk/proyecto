const connection = require("../config/db");

// Registrar una nueva alerta clínica
exports.crearAlerta = (req, res) => {
  const { tipo_alerta, descripcion, fecha_generada, id_paciente, id_usuario } = req.body;

  if (!tipo_alerta || !descripcion || !fecha_generada || !id_paciente || !id_usuario) {
    return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
  }

  const sql = `
    INSERT INTO alertaclinica (tipo_alerta, descripcion, fecha_generada, id_paciente, id_usuario)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [tipo_alerta, descripcion, fecha_generada, id_paciente, id_usuario];

  connection.query(sql, values, (err) => {
    if (err) {
      console.error("❌ Error al registrar alerta clínica:", err);
      return res.status(500).json({ mensaje: "Error al registrar la alerta" });
    }
    res.status(201).json({ mensaje: "✅ Alerta registrada correctamente" });
  });
};
