const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

exports.login = (req, res) => {
  const { correo, contraseña } = req.body;

  const sql = 'SELECT * FROM usuario WHERE correo = ? AND estado = 1';
  connection.query(sql, [correo], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error de servidor' });
    if (results.length === 0) return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });

    const user = results[0];
    bcrypt.compare(contraseña, user.contraseña, (err, match) => {
      if (err) return res.status(500).json({ error: 'Error de comparación' });
      if (!match) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: user.id_usuario, rol: user.rol },
      process.env.JWT_SECRET || 'defaultSecret',
      { expiresIn: '2h' }
    );
res.json({
  token,
  user: {
    id_usuario: user.id_usuario, 
    nombre: user.nombre,
    rol: user.rol
  }
});


    });
  });
};
