/*
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportesController');
const reportesController = require('../controllers/reportesController'); 

// 📌 Ruta para reporte visual de pacientes
router.get('/pacientes/visual', ctrl.visualPacientes);

router.post('/pacientes/pdf', reportesController.exportPacientesPDF);
router.post('/pacientes/excel', reportesController.exportPacientesExcel);

module.exports = router;*/

const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');

// Ruta para reporte visual de pacientes
router.get('/pacientes/visual', reportesController.visualPacientes);

// Ruta para exportar PDF
router.post('/pacientes/pdf', reportesController.exportPacientesPDF);

// Ruta para exportar Excel
router.post('/pacientes/excel', reportesController.exportPacientesExcel);


// CONTROLES
router.get('/controles/visual', reportesController.visualControles);
router.post('/controles/pdf', reportesController.exportControlesPDF);
router.post('/controles/excel', reportesController.exportControlesExcel);

// RIESGOS
router.get('/riesgos/visual', reportesController.visualRiesgos);
router.post('/riesgos/pdf', reportesController.exportRiesgosPDF);
router.post('/riesgos/excel', reportesController.exportRiesgosExcel);

// CITAS
router.get('/citas/visual', reportesController.visualCitas);
router.post('/citas/pdf', reportesController.exportCitasPDF);
router.post('/citas/excel', reportesController.exportCitasExcel);



module.exports = router;
