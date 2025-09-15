// controllers/auth.controller.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // mysql2/promise pool

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-prod';

// Normaliza acentos y espacios, y deja el rol listo para comparar
const normalizeRole = (rol) => {
  if (!rol) return '';
  return String(rol)
    .normalize('NFD')               // separa acentos
    .replace(/\p{Diacritic}/gu, '') // elimina acentos
    .trim();                        // quita espacios
  // Ej: 'Médico ' -> 'Medico'
};

exports.login = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
      return res.status(400).json({ error: 'correo y contraseña son obligatorios' });
    }

    // TRIM al rol para evitar espacios al final/principio
    const sql = `
      SELECT id_usuario, nombre, TRIM(rol) AS rol, contraseña
      FROM usuario
      WHERE correo = ? AND estado = 1
      LIMIT 1
    `;
    const [rows] = await pool.execute(sql, [correo]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
    }

    const user = rows[0];

    // Ojo: la columna tiene ñ
    const hash = user['contraseña'];
    const match = await bcrypt.compare(contraseña, hash);
    if (!match) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Normaliza el rol (sin acentos/espacios)
    const rolNormalizado = normalizeRole(user.rol);

    // Firma el token con ambos IDs para evitar incompatibilidades
    const token = jwt.sign(
      { id: user.id_usuario, id_usuario: user.id_usuario, rol: rolNormalizado },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.json({
      token,
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        rol: rolNormalizado, // <-- ya listo para comparar en frontend
      },
    });
  } catch (err) {
    console.error('Error en login:', err);

    if (['ETIMEDOUT', 'ECONNRESET', 'PROTOCOL_CONNECTION_LOST', 'EPIPE'].includes(err.code)) {
      return res.status(503).json({ error: 'Base de datos no disponible temporalmente' });
    }

    return res.status(500).json({ error: 'Error de servidor' });
  }
};
