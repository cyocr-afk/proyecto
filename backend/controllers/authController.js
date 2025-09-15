// controllers/auth.controller.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // << usa el pool exportado desde config/db.js

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-prod';

exports.login = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
      return res.status(400).json({ error: 'correo y contraseña son obligatorios' });
    }

    // Trae sólo lo necesario
    const sql = `
      SELECT id_usuario, nombre, rol, contraseña
      FROM usuario
      WHERE correo = ? AND estado = 1
      LIMIT 1
    `;
    const [rows] = await pool.execute(sql, [correo]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
    }

    const user = rows[0];

    // Nota: acceder a la columna con ñ de forma segura
    const hash = user['contraseña'];

    const match = await bcrypt.compare(contraseña, hash);
    if (!match) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user.id_usuario, rol: user.rol },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.json({
      token,
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        rol: user.rol,
      },
    });
  } catch (err) {
    console.error('Error en login:', err);

    // Errores de red comunes → 503
    if (['ETIMEDOUT', 'ECONNRESET', 'PROTOCOL_CONNECTION_LOST', 'EPIPE'].includes(err.code)) {
      return res.status(503).json({ error: 'Base de datos no disponible temporalmente' });
    }

    return res.status(500).json({ error: 'Error de servidor' });
  }
};
