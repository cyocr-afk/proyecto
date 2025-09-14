// controllers/reportesController.js
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const connection = require('../config/db');
const { exportPacientesExcel } = require('../utils/exportHelpers');
const { generarPDFControles, generarPDFRiesgos, generarPDFCitas } = require('../utils/pdfHelpers');
const { exportToExcelControles, exportToExcelRiesgos, exportToExcelCitas } = require('../utils/excelHelpers');

// 📊 Reporte visual de pacientes
exports.visualPacientes = (req, res) => {
  const { desde, hasta, mostrar_todos } = req.query;

  let filtros = '';
  const params = [];

  if (mostrar_todos !== 'true') {
    if (desde) {
      filtros += ' AND fecha_registro >= ?';
      params.push(desde);
    }
    if (hasta) {
      filtros += ' AND fecha_registro <= ?';
      params.push(hasta);
    }
  }

  const sqlConteo = `
    SELECT DATE_FORMAT(fecha_registro, '%Y-%m') AS mes, COUNT(*) AS cantidad
    FROM paciente
    WHERE 1=1 ${filtros}
    GROUP BY mes
    ORDER BY mes ASC
  `;

  const sqlDetalle = `
    SELECT 
      fecha_registro,
      nombre,
      dpi,
      TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) AS edad,
      fecha_nacimiento,
      direccion,
      telefono
    FROM paciente
    WHERE 1=1 ${filtros}
    ORDER BY fecha_registro DESC
  `;

  connection.query(sqlConteo, params, (err1, conteoMensual) => {
    if (err1) {
      console.error('Error en conteoMensual:', err1);
      return res.status(500).json({ error: 'Error al obtener conteo mensual' });
    }

    connection.query(sqlDetalle, params, (err2, detalle) => {
      if (err2) {
        console.error('Error en detallePacientes:', err2);
        return res.status(500).json({ error: 'Error al obtener el detalle de pacientes' });
      }

      res.json({ conteoMensual, detalle });
    });
  });
};

exports.exportPacientesPDF = async (req, res) => {
  try {
    const { desde, hasta, mostrarTodos, id_usuario } = req.body;

    let query = `
      SELECT nombre, dpi, fecha_nacimiento, direccion, telefono, fecha_registro
      FROM paciente
    `;
    const params = [];

    if (!mostrarTodos) {
      query += ' WHERE fecha_registro BETWEEN ? AND ?';
      params.push(desde, hasta);
    }

    connection.query(query, params, (err, results) => {
      if (err) {
        console.error('Error al obtener pacientes:', err);
        return res.status(500).json({ error: 'Error al obtener pacientes' });
      }

      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const timestamp = Date.now();
      const filename = `reporte_pacientes_${timestamp}.pdf`;
      const filePath = path.join(__dirname, '../reportes_generados', filename);
      const logoPath = path.join(__dirname, 'assets', 'mspas-logo.png');
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Encabezado
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 40, { width: 60 });
      }

      doc.fontSize(14).text('Centro de Atención Permanente - Zunilito', 0, 50, { align: 'center' });
      doc.fontSize(12).text('Reporte General de Pacientes', { align: 'center' });
      doc.moveDown(2);

      // 📋 Tabla
      const startX = 50;
      let y = doc.y;

      const colWidths = [70, 110, 90, 40, 90, 100, 80];
      const headers = ['Fecha Registro', 'Nombre', 'CUI/DPI', 'Edad', 'Fecha Nacimiento', 'Dirección', 'Teléfono'];

      // 🟦 Encabezados
      doc.font('Helvetica-Bold').fontSize(9);
      let x = startX;
      headers.forEach((header, i) => {
        doc.text(header, x, y, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });
      y += 20;
      doc.font('Helvetica');

      // 🟦 Datos
      results.forEach(p => {
        const fechaRegistro = new Date(p.fecha_registro).toISOString().split('T')[0];
        const fechaNacimiento = new Date(p.fecha_nacimiento).toISOString().split('T')[0];
        const edad = new Date().getFullYear() - new Date(p.fecha_nacimiento).getFullYear();

        const values = [
          fechaRegistro,
          p.nombre,
          p.dpi,
          edad.toString(),
          fechaNacimiento,
          p.direccion,
          p.telefono || ''
        ];

        x = startX;
        let maxHeight = 0;
        const heights = [];

        values.forEach((val, i) => {
          const height = doc.heightOfString(val, { width: colWidths[i], align: 'left' });
          heights.push(height);
          if (height > maxHeight) maxHeight = height;
        });

        values.forEach((val, i) => {
          doc.text(val, x, y, {
            width: colWidths[i],
            align: 'left'
          });
          x += colWidths[i];
        });

        y += maxHeight + 8;

        if (y > 750) {
          doc.addPage();
          y = 50;
        }
      });

      doc.end();

      stream.on('finish', () => {
        const ruta_archivo = `/reportes_generados/${filename}`;
        const tipo = 'pacientes';
        const descripcion = `Reporte de pacientes generado con ${results.length} registros`;

        const insertQuery = `
          INSERT INTO reporte (tipo, fecha_generado, descripcion, ruta_archivo, id_usuario)
          VALUES (?, NOW(), ?, ?, ?)
        `;
        connection.query(insertQuery, [tipo, descripcion, ruta_archivo, id_usuario], (err2) => {
          if (err2) {
            console.error('Error al registrar reporte:', err2);
            return res.status(500).json({ error: 'Error al guardar registro de reporte' });
          }

          res.download(filePath, filename);
        });
      });

      stream.on('error', (err) => {
        console.error('Error al escribir PDF:', err);
        res.status(500).json({ error: 'No se pudo generar el PDF' });
      });
    });
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    res.status(500).json({ error: 'Error al exportar PDF' });
  }
};



// 📤 Exportar Excel
exports.exportPacientesExcel = async (req, res) => {
  const { desde, hasta, mostrarTodos, id_usuario } = req.body;
  try {
    const filePath = await exportPacientesExcel({ desde, hasta, mostrarTodos });

    connection.query(`
      INSERT INTO reporte (tipo, descripcion, fecha_generado, id_usuario)
      VALUES (?, ?, NOW(), ?)`,
      ['Pacientes', 'Reporte general de pacientes', id_usuario],
      (error) => {
        if (error) console.error('Error al registrar reporte:', error);
      });

    res.download(filePath);
  } catch (err) {
    console.error('Error al generar Excel:', err);
    res.status(500).send('Error al generar el archivo Excel');
  }
};

//controles prenatales
exports.visualControles = (req, res) => {
const { desde, hasta, mostrar_todos } = req.query;
let sql = `
SELECT c.*, p.nombre AS nombre_paciente, p.dpi
FROM controlprenatal c
INNER JOIN paciente p ON c.id_paciente = p.id_paciente
WHERE 1=1
`;
const params = [];

if (!mostrar_todos || mostrar_todos === 'false') {
if (desde) {
sql += ' AND c.fecha_control >= ?';
params.push(desde);
}
if (hasta) {
sql += ' AND c.fecha_control <= ?';
params.push(hasta);
}
}
connection.query(sql, params, (err, rows) => {
if (err) return res.status(500).json({ error: err });


// agrupación por mes para gráfico
const conteoMensual = {};
rows.forEach((r) => {
const mes = r.fecha_control.toISOString().slice(0, 7);
conteoMensual[mes] = (conteoMensual[mes] || 0) + 1;
});
const resultadoGrafico = Object.entries(conteoMensual).map(([mes, cantidad]) => ({ mes, cantidad }));


res.json({ detalle: rows, conteoMensual: resultadoGrafico });
});
};


exports.exportControlesPDF = (req, res) => {
const { desde, hasta, mostrarTodos, id_usuario } = req.body;
let sql = `
SELECT c.*, p.nombre AS nombre_paciente, p.dpi
FROM controlprenatal c
INNER JOIN paciente p ON c.id_paciente = p.id_paciente
WHERE 1=1
`;
const params = [];


if (!mostrarTodos) {
if (desde) {
sql += ' AND c.fecha_control >= ?';
params.push(desde);
}
if (hasta) {
sql += ' AND c.fecha_control <= ?';
params.push(hasta);
}
}


connection.query(sql, params, async (err, rows) => {
if (err) return res.status(500).json({ error: err });
const filePath = await generarPDFControles(rows);


connection.query(
`INSERT INTO reporte (tipo, fecha_generado, descripcion, ruta_archivo, id_usuario)
VALUES (?, NOW(), ?, ?, ?)`,
['Controles Prenatales', 'Exportación PDF de controles', filePath, id_usuario]
);


res.download(filePath);
});
};

exports.exportControlesExcel = (req, res) => {
const { desde, hasta, mostrarTodos, id_usuario } = req.body;
let sql = `
SELECT c.*, p.nombre AS nombre_paciente, p.dpi
FROM controlprenatal c
INNER JOIN paciente p ON c.id_paciente = p.id_paciente
WHERE 1=1
`;
const params = [];


if (!mostrarTodos) {
if (desde) {
sql += ' AND c.fecha_control >= ?';
params.push(desde);
}
if (hasta) {
sql += ' AND c.fecha_control <= ?';
params.push(hasta);
}
}


connection.query(sql, params, async (err, rows) => {
if (err) return res.status(500).json({ error: err });
const filePath = await exportToExcelControles(rows);


connection.query(
`INSERT INTO reporte (tipo, fecha_generado, descripcion, ruta_archivo, id_usuario)
VALUES (?, NOW(), ?, ?, ?)`,
['Controles Prenatales', 'Exportación Excel de controles', filePath, id_usuario]
);


res.download(filePath);
});
};

//riesgos obstetricos

exports.visualRiesgos = (req, res) => {
const { desde, hasta, mostrar_todos } = req.query;
let sql = `
SELECT r.*, p.nombre AS nombre_paciente, p.dpi
FROM riesgoobstetrico r
INNER JOIN paciente p ON r.id_paciente = p.id_paciente
WHERE 1=1
`;
const params = [];


if (!mostrar_todos || mostrar_todos === 'false') {
if (desde) {
sql += ' AND r.fecha_registro >= ?';
params.push(desde);
}
if (hasta) {
sql += ' AND r.fecha_registro <= ?';
params.push(hasta);
}
}


connection.query(sql, params, (err, rows) => {
if (err) return res.status(500).json({ error: err });


const riesgos = [
'embarazo_multiples','hipertension','diabetes','infecciones','anemia','desnutricion','obesidad','dolor_abdominal','ictericia','consumo_drogas'
];


const distribucion = riesgos.map((campo) => {
const cantidad = rows.filter((r) => r[campo] === 1).length;
return { nombre: campo.replace('_', ' ').toUpperCase(), valor: cantidad };
});


res.json({ detalle: rows, distribucion });
});
};


exports.exportRiesgosPDF = (req, res) => {
const { desde, hasta, mostrarTodos, id_usuario } = req.body;
let sql = `
SELECT r.*, p.nombre AS nombre_paciente, p.dpi
FROM riesgoobstetrico r
INNER JOIN paciente p ON r.id_paciente = p.id_paciente
WHERE 1=1
`;
const params = [];


if (!mostrarTodos) {
if (desde) {
sql += ' AND r.fecha_registro >= ?';
params.push(desde);
}
if (hasta) {
sql += ' AND r.fecha_registro <= ?';
params.push(hasta);
}
}


connection.query(sql, params, async (err, rows) => {
if (err) return res.status(500).json({ error: err });
const filePath = await generarPDFRiesgos(rows);


connection.query(
`INSERT INTO reporte (tipo, fecha_generado, descripcion, ruta_archivo, id_usuario)
VALUES (?, NOW(), ?, ?, ?)`,
['Riesgos Obstétricos', 'Exportación PDF de riesgos', filePath, id_usuario]
);


res.download(filePath);
});
};


exports.exportRiesgosExcel = (req, res) => {
const { desde, hasta, mostrarTodos, id_usuario } = req.body;
let sql = `
SELECT r.*, p.nombre AS nombre_paciente, p.dpi
FROM riesgoobstetrico r
INNER JOIN paciente p ON r.id_paciente = p.id_paciente
WHERE 1=1
`;
const params = [];


if (!mostrarTodos) {
if (desde) {
sql += ' AND r.fecha_registro >= ?';
params.push(desde);
}
if (hasta) {
sql += ' AND r.fecha_registro <= ?';
params.push(hasta);
}
}


connection.query(sql, params, async (err, rows) => {
if (err) return res.status(500).json({ error: err });
const filePath = await exportToExcelRiesgos(rows);


connection.query(
`INSERT INTO reporte (tipo, fecha_generado, descripcion, ruta_archivo, id_usuario)
VALUES (?, NOW(), ?, ?, ?)`,
['Riesgos Obstétricos', 'Exportación Excel de riesgos', filePath, id_usuario]
);


res.download(filePath);
});
};

// Citas seguimiento
exports.visualCitas = (req, res) => {
  const { desde, hasta, mostrar_todos } = req.query;
  let sql = `
    SELECT c.*, p.nombre AS nombre_paciente, p.dpi, m.nombre AS motivo
    FROM citaseguimiento c
    INNER JOIN paciente p ON c.id_paciente = p.id_paciente
    LEFT JOIN motivos_cita m ON c.id_motivo = m.id_motivo
    WHERE 1=1
  `;
  const params = [];

  if (!mostrar_todos || mostrar_todos === 'false') {
    if (desde) {
      sql += ' AND c.fecha_cita >= ?';
      params.push(desde);
    }
    if (hasta) {
      sql += ' AND c.fecha_cita <= ?';
      params.push(hasta);
    }
  }

  connection.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err });

    const estados = ['Pendiente', 'Realizada', 'Cancelada'];
    const distribucion = estados.map((estado) => ({
      estado,
      valor: rows.filter(r => r.estado === estado).length
    }));

    res.json({ detalle: rows, distribucion });
  });
};

exports.exportCitasPDF = (req, res) => {
  const { desde, hasta, mostrarTodos, id_usuario } = req.body;
  let sql = `
    SELECT c.*, p.nombre AS nombre_paciente, p.dpi, m.nombre AS motivo
    FROM citaseguimiento c
    INNER JOIN paciente p ON c.id_paciente = p.id_paciente
    LEFT JOIN motivos_cita m ON c.id_motivo = m.id_motivo
    WHERE 1=1
  `;
  const params = [];

  if (!mostrarTodos) {
    if (desde) {
      sql += ' AND c.fecha_cita >= ?';
      params.push(desde);
    }
    if (hasta) {
      sql += ' AND c.fecha_cita <= ?';
      params.push(hasta);
    }
  }

  connection.query(sql, params, async (err, rows) => {
    if (err) return res.status(500).json({ error: err });

    const filePath = await generarPDFCitas(rows);

    connection.query(
      `INSERT INTO reporte (tipo, fecha_generado, descripcion, ruta_archivo, id_usuario)
       VALUES (?, NOW(), ?, ?, ?)`,
      ['Citas de Seguimiento', 'Exportación PDF de citas', filePath, id_usuario]
    );

    res.download(filePath);
  });
};

exports.exportCitasExcel = (req, res) => {
  const { desde, hasta, mostrarTodos, id_usuario } = req.body;
  let sql = `
    SELECT c.*, p.nombre AS nombre_paciente, p.dpi, m.nombre AS motivo
    FROM citaseguimiento c
    INNER JOIN paciente p ON c.id_paciente = p.id_paciente
    LEFT JOIN motivos_cita m ON c.id_motivo = m.id_motivo
    WHERE 1=1
  `;
  const params = [];

  if (!mostrarTodos) {
    if (desde) {
      sql += ' AND c.fecha_cita >= ?';
      params.push(desde);
    }
    if (hasta) {
      sql += ' AND c.fecha_cita <= ?';
      params.push(hasta);
    }
  }

  connection.query(sql, params, async (err, rows) => {
    if (err) return res.status(500).json({ error: err });

    const filePath = await exportToExcelCitas(rows);

    connection.query(
      `INSERT INTO reporte (tipo, fecha_generado, descripcion, ruta_archivo, id_usuario)
       VALUES (?, NOW(), ?, ?, ?)`,
      ['Citas de Seguimiento', 'Exportación Excel de citas', filePath, id_usuario]
    );

    res.download(filePath);
  });
};