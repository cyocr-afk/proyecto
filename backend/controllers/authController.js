const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connection = require('../config/db'); // Usando mysql2 normal

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-prod';

exports.login = (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json({ error: 'correo y contraseña son obligatorios' });
  }

  const sql = `SELECT id_usuario, nombre, rol, contraseña FROM usuario WHERE correo = ? AND estado = 1 LIMIT 1`;

  connection.query(sql, [correo], (err, results) => {
    if (err) {
      console.error('❌ Error al buscar usuario:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
    }

    const user = results[0];
    const hash = user['contraseña'];

    bcrypt.compare(contraseña, hash, (err, match) => {
      if (err) {
        console.error('❌ Error al comparar contraseña:', err);
        return res.status(500).json({ error: 'Error en el servidor' });
      }

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
    });
  });
};
