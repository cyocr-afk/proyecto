const express = require('express');
const router = express.Router();
const connection = require('../config/db');

router.post('/riesgos', (req, res) => {
  const {
    numero_partos,
    no_abortos,
    no_hijos_muertos,
    no_hijos_vivos,
    no_cesareas,
    embarazo_multiples,
    hipertension,
    diabetes,
    infecciones,
    cirugias_previas,
    presion_arterial_diastolica,
    anemia,
    desnutricion,
    obesidad,
    dolor_abdominal,
    ictericia,
    consumo_drogas,
    observaciones,
    fecha_registro,
    id_paciente,
    id_usuario
  } = req.body;

  if (!id_paciente || !id_usuario) {
    return res.status(400).json({ error: 'Faltan datos del paciente o del usuario.' });
  }

  const fecha = fecha_registro || new Date().toISOString().split('T')[0];

  const sql = `
    INSERT INTO riesgoobstetrico (
      numero_partos, no_abortos, no_hijos_muertos, no_hijos_vivos,
      no_cesareas, embarazo_multiples, hipertension, diabetes,
      infecciones, cirugias_previas, presion_arterial_diastolica,
      anemia, desnutricion, obesidad, dolor_abdominal,
      ictericia, consumo_drogas, observaciones, fecha_registro,
      id_paciente, id_usuario
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const valores = [
    numero_partos || null,
    no_abortos || null,
    no_hijos_muertos || null,
    no_hijos_vivos || null,
    no_cesareas || null,
    embarazo_multiples || 0,
    hipertension || 0,
    diabetes || 0,
    infecciones || 0,
    cirugias_previas || 0,
    presion_arterial_diastolica || null,
    anemia || 0,
    desnutricion || 0,
    obesidad || 0,
    dolor_abdominal || 0,
    ictericia || 0,
    consumo_drogas || 0,
    observaciones || null,
    fecha_registro,
    id_paciente,
    id_usuario
  ];

  connection.query(sql, valores, (err, result) => {
    if (err) {
      console.error('Error al registrar riesgo obstétrico:', err);
      return res.status(500).json({ error: 'Error al registrar riesgo obstétrico.' });
    }
    return res.status(201).json({ mensaje: 'Riesgo obstétrico registrado correctamente.' });
  });
});

module.exports = router;
