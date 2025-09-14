// utils/excelHelpers.js
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const exportDir = path.join(__dirname, '../reportes_generados');
if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
}

function formatHora(hora) {
  return hora?.slice(0, 5);
}

function styleHeader(row) {
  row.eachCell(cell => {
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'D9E1F2' } // azul claro
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    cell.alignment = { horizontal: 'center' };
  });
}

async function autoSizeColumns(sheet) {
  sheet.columns.forEach(column => {
    let maxLength = 10;
    column.eachCell({ includeEmpty: true }, cell => {
      const value = cell.value ? cell.value.toString() : '';
      const columnLength = value.length;
      if (columnLength > maxLength) maxLength = columnLength;
    });
    column.width = maxLength + 2;
  });
}

// 👩‍⚕️ CONTROLES PRENATALES
async function exportToExcelControles(data) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Controles Prenatales');

  const header = ['Fecha', 'Paciente', 'DPI', 'Edad Gest.', 'Peso', 'Presión', 'Altura Uterina', 'FCF', 'Mov. Fetales'];
  styleHeader(sheet.addRow(header));

  data.forEach(r => {
    sheet.addRow([
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
  });

  await autoSizeColumns(sheet);

  const filePath = path.join(exportDir, `reporte_controles_${Date.now()}.xlsx`);
  await workbook.xlsx.writeFile(filePath);
  return filePath;
}

// 🚨 RIESGOS OBSTÉTRICOS
async function exportToExcelRiesgos(data) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Riesgos Obstétricos');

  const header = ['Fecha', 'Paciente', 'DPI', 'Partos', 'Abortos', 'Hijos Vivos', 'Hijos Muertos', 'Observaciones'];
  styleHeader(sheet.addRow(header));

  data.forEach(r => {
    sheet.addRow([
      formatFecha(r.fecha_registro),
      r.nombre_paciente,
      r.dpi,
      r.numero_partos,
      r.no_abortos,
      r.no_hijos_vivos,
      r.no_hijos_muertos,
      r.observaciones || ''
    ]);
  });

  await autoSizeColumns(sheet);

  const filePath = path.join(exportDir, `reporte_riesgos_${Date.now()}.xlsx`);
  await workbook.xlsx.writeFile(filePath);
  return filePath;
}

// 📆 CITAS DE SEGUIMIENTO
async function exportToExcelCitas(data) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Citas de Seguimiento');

  const header = ['Fecha', 'Hora', 'Paciente', 'DPI', 'Motivo', 'Estado'];
  styleHeader(sheet.addRow(header));

  data.forEach(c => {
    sheet.addRow([
      formatFecha(c.fecha_cita),
      formatHora(c.hora),
      c.nombre_paciente,
      c.dpi,
      c.motivo || 'No especificado',
      c.estado
    ]);
  });

  await autoSizeColumns(sheet);

  const filePath = path.join(exportDir, `reporte_citas_${Date.now()}.xlsx`);
  await workbook.xlsx.writeFile(filePath);
  return filePath;
}

module.exports = {
  exportToExcelControles,
  exportToExcelRiesgos,
  exportToExcelCitas
};
