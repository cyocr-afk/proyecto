// routes/alerta.js
const express = require("express");
const router = express.Router();
const alertaController = require("../controllers/alertaController");

router.post("/", alertaController.crearAlerta);

module.exports = router;
