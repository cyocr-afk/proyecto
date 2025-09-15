// controllers/alertas.controller.js
const pool = require("../config/db");

// Registrar una nueva alerta clínica
exports.crearAlerta = async (req, res) => {
  try {
    const { tipo_alerta, descripcion, fecha_generada, id_paciente, id_usuario } = req.body;

    // Validaciones básicas
    if (!tipo_alerta || !descripcion || !fecha_generada || !id_paciente || !id_usuario) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    const idPacienteNum = Number(id_paciente);
    const idUsuarioNum  = Number(id_usuario);
    if (!Number.isInteger(idPacienteNum) || !Number.isInteger(idUsuarioNum)) {
      return res.status(400).json({ mensaje: "id_paciente e id_usuario deben ser numéricos" });
    }

    // Acepta ISO (recomendado) u otros formatos que Date entienda. mysql2 convierte Date -> 'YYYY-MM-DD HH:MM:SS'
    const fecha = new Date(fecha_generada);
    if (isNaN(fecha.getTime())) {
      return res.status(400).json({ mensaje: "fecha_generada no es válida (usa ISO 8601 si es posible)" });
    }

    const sql = `
      INSERT INTO alertaclinica (tipo_alerta, descripcion, fecha_generada, id_paciente, id_usuario)
      VALUES (?, ?, ?, ?, ?)
    `;

    const values = [tipo_alerta, descripcion, fecha, idPacienteNum, idUsuarioNum];

    const [result] = await pool.execute(sql, values);

    return res.status(201).json({
      mensaje: "✅ Alerta registrada correctamente",
      id_alerta: result.insertId
    });
  } catch (err) {
    console.error("❌ Error al registrar alerta clínica:", err);

    // Mensajes más claros según código de error MySQL
    if (err.code === "ER_NO_SUCH_TABLE") {
      return res.status(500).json({ mensaje: "La tabla 'alertaclinica' no existe" });
    }
    if (err.code === "ER_BAD_FIELD_ERROR") {
      return res.status(500).json({ mensaje: "Alguna columna en la consulta no existe" });
    }
    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ mensaje: "id_paciente o id_usuario no existen (FK inválida)" });
    }
    if (err.code === "PROTOCOL_CONNECTION_LOST" || err.code === "ETIMEDOUT") {
      return res.status(503).json({ mensaje: "Servicio de base de datos no disponible temporalmente" });
    }

    return res.status(500).json({ mensaje: "Error al registrar la alerta" });
  }
};
