const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '../controllers/assets/mspas-logo.png');

function crearEncabezadoPDF(doc, titulo) {
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 30, { width: 50 });
  }
  doc.fontSize(14).font('Helvetica-Bold').text('Centro de Atención Permanente -CAP-', 120, 35);
  doc.text('Zunilito Suchitepéquez', 120, 55);
  doc.fontSize(16).text(titulo, { align: 'center' });
  doc.moveDown(2);
}

function guardarPDF(doc, nombre) {
  const outputDir = path.join(__dirname, '../reportes_generados');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  const filePath = path.join(outputDir, `${nombre}_${Date.now()}.pdf`);
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);
  doc.end();
  return new Promise((resolve) => {
    stream.on('finish', () => resolve(filePath));
  });
}

function dibujarTabla(doc, headers, rows, startY = doc.y + 10, columnWidths = []) {
  const startX = 50;
  const rowHeight = 22;
  const maxY = doc.page.height - 50;

  doc.font('Helvetica-Bold').fontSize(10);
  let x = startX;
  doc.fillColor('#e0e0e0');
  headers.forEach((header, i) => {
    doc.rect(x, startY, columnWidths[i], rowHeight).fillAndStroke('#e0e0e0', '#000');
    doc.fillColor('#000').text(header, x + 2, startY + 6, {
      width: columnWidths[i] - 4,
      align: 'left'
    });
    x += columnWidths[i];
  });

  doc.font('Helvetica').fontSize(9);
  let y = startY + rowHeight;

  rows.forEach((row) => {
    if (y + rowHeight > maxY) {
      doc.addPage();
      y = 50;

      // Redibujar encabezado
      let x = startX;
      doc.font('Helvetica-Bold').fillColor('#e0e0e0');
      headers.forEach((header, i) => {
        doc.rect(x, y, columnWidths[i], rowHeight).fillAndStroke('#e0e0e0', '#000');
        doc.fillColor('#000').text(header, x + 2, y + 6, {
          width: columnWidths[i] - 4,
          align: 'left'
        });
        x += columnWidths[i];
      });
      doc.font('Helvetica').fillColor('black');
      y += rowHeight;
    }

    let x = startX;
    row.forEach((cell, i) => {
      doc.rect(x, y, columnWidths[i], rowHeight).stroke();
      doc.text(String(cell), x + 2, y + 6, {
        width: columnWidths[i] - 4,
        align: 'left'
      });
      x += columnWidths[i];
    });
    y += rowHeight;
  });
}

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function formatHora(hora) {
  return hora?.slice(0, 5);
}

// 👩‍⚕️ CONTROLES PRENATALES
async function generarPDFControles(data) {
  const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
  crearEncabezadoPDF(doc, 'Reporte de Controles Prenatales');

  const headers = [
    'Fecha', 'Paciente', 'CUI/DPI', 'Edad Gestacional',
    'Peso (kg)', 'Presión', 'Altura Uterina',
    'FCF', 'Mov. Fetales'
  ];

  const columnWidths = [70, 130, 90, 80, 70, 80, 90, 60, 90];

  const rows = data.map(r => [
    formatFecha(r.fecha_control),
    r.nombre_paciente,
    r.dpi,
    r.edad_gestacional,
    r.peso,
    r.presion_arterial,
    r.altura_uterina,
    r.frecuencia_cardiaca_fetal,
    r.movimientos_fetales
  ]);

  dibujarTabla(doc, headers, rows, doc.y + 10, columnWidths);
  return await guardarPDF(doc, 'reporte_controles');
}

// 🚨 RIESGOS OBSTÉTRICOS
async function generarPDFRiesgos(data) {
  const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
  crearEncabezadoPDF(doc, 'Reporte de Riesgos Obstétricos');

  const headers = [
    'Fecha', 'Paciente', 'CUI/DPI',
    'Partos', 'Abortos', 'Hijos Vivos', 'Hijos Muertos',
    'Observaciones'
  ];

  const columnWidths = [70, 130, 90, 70, 70, 80, 80, 200];

  const rows = data.map(r => [
    formatFecha(r.fecha_registro),
    r.nombre_paciente,
    r.dpi,
    r.numero_partos,
    r.no_abortos,
    r.no_hijos_vivos,
    r.no_hijos_muertos,
    r.observaciones || ''
  ]);

  dibujarTabla(doc, headers, rows, doc.y + 10, columnWidths);
  return await guardarPDF(doc, 'reporte_riesgos');
}

// 📆 Citas (mantiene formato vertical, ya funciona bien)
async function generarPDFCitas(data) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  crearEncabezadoPDF(doc, 'Reporte de Citas de Seguimiento');

  const headers = ['Fecha', 'Hora', 'Paciente', 'CUI/DPI', 'Motivo', 'Estado'];
  const columnWidths = [60, 50, 110, 90, 130, 60];

  const rows = data.map(r => [
    formatFecha(r.fecha_cita),
    formatHora(r.hora),
    r.nombre_paciente,
    r.dpi,
    r.motivo,
    r.estado
  ]);

  dibujarTabla(doc, headers, rows, doc.y + 10, columnWidths);
  return await guardarPDF(doc, 'reporte_citas');
}

module.exports = {
  generarPDFControles,
  generarPDFRiesgos,
  generarPDFCitas
};
