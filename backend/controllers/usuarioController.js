
const connection = require('../config/db');
const bcrypt = require('bcrypt');

/**
 * Registrar un nuevo usuario
 */
exports.crearUsuario = (req, res) => {
  const { nombre, correo, contraseña, rol, estado } = req.body;

  // ✅ Validaciones
  if (!nombre || nombre.length < 8) {
    return res.status(400).json({ error: 'El nombre debe tener al menos 8 caracteres' });
  }
  if (!correo) {
    return res.status(400).json({ error: 'El correo es obligatorio' });
  }
  if (!contraseña || contraseña.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener mínimo 8 caracteres' });
  }
  if (!['Administrador', 'Médico', 'Enfermera'].includes(rol)) {
    return res.status(400).json({ error: 'Rol no válido' });
  }

  // ✅ Encriptar contraseña
  const hashedPassword = bcrypt.hashSync(contraseña, 10);

  const sql = `
    INSERT INTO usuario (nombre, correo, contraseña, rol, estado)
    VALUES (?, ?, ?, ?, ?)
  `;

  connection.query(
    sql,
    [nombre, correo, hashedPassword, rol, estado || 1],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'El correo ya está registrado' });
        }
        console.error('Error al registrar usuario:', err);
        return res.status(500).json({ error: 'Error al registrar usuario' });
      }
      res.json({ message: '✅ Usuario registrado con éxito', id: result.insertId });
    }
  );
};

/**
 * Obtener todos los usuarios
 */
exports.obtenerUsuarios = (req, res) => {
  const sql = 'SELECT id_usuario, nombre, correo, rol, estado FROM usuario ORDER BY id_usuario DESC';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener usuarios:', err);
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
    res.json(results);
  });
};

/**
 * Actualizar estado (activar/desactivar usuario)
 */
exports.actualizarEstado = (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (estado !== 0 && estado !== 1) {
    return res.status(400).json({ error: 'El estado debe ser 0 (inactivo) o 1 (activo)' });
  }

  const sql = 'UPDATE usuario SET estado = ? WHERE id_usuario = ?';
  connection.query(sql, [estado, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar estado:', err);
      return res.status(500).json({ error: 'Error al actualizar estado' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Estado actualizado con éxito' });
  });
};
