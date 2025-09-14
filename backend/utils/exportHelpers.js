const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const connection = require('../config/db');

exports.exportPacientesExcel = async ({ desde, hasta, mostrarTodos }) => {
  return new Promise((resolve, reject) => {
    let query = 'SELECT nombre, dpi, fecha_nacimiento, direccion, telefono, fecha_registro FROM paciente';
    const params = [];

    if (!mostrarTodos) {
      query += ' WHERE fecha_registro BETWEEN ? AND ?';
      params.push(desde, hasta);
    }

    connection.query(query, params, async (err, results) => {
      if (err) {
        console.error('Error al obtener pacientes:', err);
        return reject(err);
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Pacientes');

      // Encabezados
      worksheet.addRow([
        'Fecha Registro', 'Nombre', 'CUI/DPI', 'Edad',
        'Fecha Nacimiento', 'Dirección', 'Teléfono'
      ]);

      // Datos
      results.forEach(p => {
        const fechaRegistro = new Date(p.fecha_registro).toISOString().split('T')[0];
        const fechaNacimiento = new Date(p.fecha_nacimiento).toISOString().split('T')[0];
        const edad = new Date().getFullYear() - new Date(p.fecha_nacimiento).getFullYear();

        worksheet.addRow([
          fechaRegistro,
          p.nombre,
          p.dpi,
          edad,
          fechaNacimiento,
          p.direccion,
          p.telefono || ''
        ]);
      });

      // Ajustar ancho de columnas automáticamente
      worksheet.columns.forEach(column => {
        let maxLength = 10;
        column.eachCell({ includeEmpty: true }, cell => {
          const cellLength = cell.value ? cell.value.toString().length : 10;
          if (cellLength > maxLength) {
            maxLength = cellLength;
          }
        });
        column.width = maxLength + 2;
      });

      // Guardar archivo
      const timestamp = Date.now();
      const filename = `reporte_pacientes_${timestamp}.xlsx`;
      const filePath = path.join(__dirname, '../reportes_generados', filename);

      await workbook.xlsx.writeFile(filePath);
      resolve(filePath);
    });
  });
};
