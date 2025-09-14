const connection = require('../config/db');

exports.listarHistorial = (req, res) => {
  const { id_paciente } = req.query;
  if (!id_paciente) {
    return res.status(400).json({ ok: false, msg: "Debe enviar el id_paciente" });
  }

  const sql = `
    SELECT
      p.id_paciente,
      p.nombre,
      p.dpi,
      DATE_FORMAT(p.fecha_nacimiento, '%Y-%m-%d') AS fecha_nacimiento,
      TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS edad,

      -- CONTROLES
      (SELECT COUNT(*) FROM controlprenatal WHERE id_paciente = p.id_paciente) AS total_controles,
      (SELECT MAX(DATE_FORMAT(fecha_control, '%Y-%m-%d')) FROM controlprenatal WHERE id_paciente = p.id_paciente) AS ultima_fecha_control,
      (SELECT GROUP_CONCAT(CONCAT(
        'Fecha: ', DATE_FORMAT(fecha_control, '%Y-%m-%d'),
        ' | Peso: ', peso,
        ' lb | FC: ', frecuencia_cardiaca_fetal,
        ' | Mov: ', movimientos_fetales,
        ' | PA: ', presion_arterial,
        ' | RH: ', grupo_rh,
        ' | Evaluaciones: ', papanicolau
      ) SEPARATOR '\n')
       FROM controlprenatal WHERE id_paciente = p.id_paciente) AS detalles_controles,

      -- RIESGOS
      (SELECT COUNT(*) FROM riesgoobstetrico WHERE id_paciente = p.id_paciente) AS total_riesgos,
      (SELECT MAX(DATE_FORMAT(fecha_registro, '%Y-%m-%d')) FROM riesgoobstetrico WHERE id_paciente = p.id_paciente) AS ultima_fecha_riesgo,
      (SELECT GROUP_CONCAT(CONCAT(
        'Fecha: ', DATE_FORMAT(fecha_registro, '%Y-%m-%d'),
        ' | Partos: ', numero_partos,
        ' | Hijos vivos: ', no_hijos_vivos,
        ' | Hijos muertos: ', no_hijos_muertos,
        ' | Abortos: ', no_abortos,
        ' | Cesáreas: ', no_cesareas
      ) SEPARATOR '\n')
       FROM riesgoobstetrico WHERE id_paciente = p.id_paciente) AS detalles_riesgos,

      -- CITAS
      (SELECT GROUP_CONCAT(CONCAT(
        'Fecha: ', DATE_FORMAT(fecha_cita, '%Y-%m-%d'),
        ' | Motivo: ', IFNULL(m.nombre, 'N/D'),
        ' | Estado: ', estado
      ) SEPARATOR '\n')
       FROM citaseguimiento c
       LEFT JOIN motivos_cita m ON m.id_motivo = c.id_motivo
       WHERE c.id_paciente = p.id_paciente) AS detalles_citas,

      (SELECT MIN(DATE_FORMAT(fecha_cita, '%Y-%m-%d'))
       FROM citaseguimiento
       WHERE id_paciente = p.id_paciente AND estado = 'Pendiente' AND fecha_cita > CURDATE()
      ) AS proxima_cita

    FROM paciente p
    WHERE p.id_paciente = ?
  `;

  connection.query(sql, [id_paciente], (err, rows) => {
    if (err) {
      console.error("Error al consultar historial completo:", err);
      return res.status(500).json({ ok: false, msg: "Error al consultar historial completo" });
    }
    return res.json({ ok: true, data: rows[0] });
  });
};
