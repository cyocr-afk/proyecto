const express = require("express");
const router = express.Router();
const historialController = require("../controllers/historialPacienteController");

// GET /api/historial?id_paciente=1
router.get("/", historialController.listarHistorial);

module.exports = router;
