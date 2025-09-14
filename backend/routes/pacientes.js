const express = require("express");
const router = express.Router();
const connection = require("../config/db");

// Buscar pacientes por nombre o DPI
router.get("/", (req, res) => {
  const search = req.query.nombre;
  if (!search) {
    return res.status(400).json({ error: "Parámetro de búsqueda requerido" });
  }

  const sql = `
    SELECT id_paciente, nombre, dpi, fecha_nacimiento, direccion
    FROM paciente 
    WHERE nombre LIKE ? OR dpi LIKE ? 
    LIMIT 100
  `;

  const query = `%${search}%`;
  connection.query(sql, [query, query], (err, result) => {
    if (err) {
      console.error("Error al buscar pacientes:", err);
      return res.status(500).json({ error: "Error al buscar pacientes" });
    }
    res.status(200).json(result);
  });
});

// ✅ Obtener cantidad de controles prenatales por paciente
router.get("/:id/controles-prenatales", (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT COUNT(*) AS total
    FROM controlprenatal
    WHERE id_paciente = ?
  `;

  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error al contar controles prenatales:", err);
      return res.status(500).json({ error: "Error al contar controles prenatales" });
    }
    res.status(200).json({ total: result[0].total });
  });
});

// ✅ Obtener cantidad de riesgos obstétricos por paciente
router.get("/:id/riesgos-obstetricos", (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT COUNT(*) AS total
    FROM riesgoobstetrico
    WHERE id_paciente = ?
  `;

  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error al contar riesgos obstétricos:", err);
      return res.status(500).json({ error: "Error al contar riesgos obstétricos" });
    }
    res.status(200).json({ total: result[0].total });
  });
});

module.exports = router;
