const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// ✅ Registrar usuario
router.post('/', usuarioController.crearUsuario);

// ✅ Listar usuarios (para el panel de administración, más adelante)
router.get('/', usuarioController.obtenerUsuarios);

// ✅ Actualizar estado (activar/desactivar usuario)
router.patch('/:id', usuarioController.actualizarEstado);

module.exports = router;
