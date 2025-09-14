const express = require('express');
const router = express.Router();
const connection = require('../config/db');

// ✅ REGISTRO DE CONTROL PRENATAL
router.post('/controles', (req, res) => {
  const {
    fecha_control,
    edad_gestacional,
    peso,
    presion_arterial,
    respiraciones_minuto,
    hemorragia_vaginal,
    flujo_vaginal,
    hematologia_completa,
    grupo_rh,
    vdrl,
    glicemia,
    vih,
    papanicolau,
    altura_uterina,
    frecuencia_cardiaca_fetal,
    fondo_uterino,
    movimientos_fetales,
    observaciones,
    id_paciente,
    id_usuario

  } = req.body;

  if (!fecha_control || !edad_gestacional || !id_paciente || !id_usuario) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }

  const sql = `
    INSERT INTO controlprenatal (
      fecha_control, edad_gestacional, peso, presion_arterial,
      respiraciones_minuto, hemorragia_vaginal, flujo_vaginal,
      hematologia_completa, grupo_rh, vdrl, glicemia, vih, papanicolau,
      altura_uterina, frecuencia_cardiaca_fetal, fondo_uterino,
      movimientos_fetales, observaciones, id_paciente, id_usuario
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
  `;

  const valores = [
    fecha_control,
    edad_gestacional,
    peso || null,
    presion_arterial || null,
    respiraciones_minuto || null,
    hemorragia_vaginal || 0,
    flujo_vaginal || 0,
    hematologia_completa || 0,
    grupo_rh || null,
    vdrl || 0,
    glicemia || null,
    vih || 0,
    papanicolau || 0,
    altura_uterina || null,
    frecuencia_cardiaca_fetal || null,
    fondo_uterino || null,
    movimientos_fetales || null,
    observaciones || null,
    id_paciente,
    id_usuario
  ];

  connection.query(sql, valores, (err, result) => {
    if (err) {
      console.error('Error al insertar control prenatal:', err);
      return res.status(500).json({ error: 'Error del servidor al registrar el control.' });
    }
    res.status(201).json({ mensaje: 'Control prenatal registrado exitosamente.' });
  });
});

module.exports = router;
