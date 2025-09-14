// routes/citas.js

const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citasController');

router.post('/', citasController.registrarCita);
router.get('/', citasController.obtenerCitas);
router.put('/:id', citasController.actualizarEstado);

module.exports = router;
