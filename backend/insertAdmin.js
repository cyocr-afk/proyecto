const bcrypt = require('bcrypt');
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const admin = {
  nombre: 'Administrador General',
  correo: 'admin@capzunilito.com',
  contraseña: 'admin123', // será encriptada
  rol: 'Administrador'
};

bcrypt.hash(admin.contraseña, 10, (err, hash) => {
  if (err) throw err;

  const sql = 'INSERT INTO usuario (nombre, correo, contraseña, rol) VALUES (?, ?, ?, ?)';
  connection.query(sql, [admin.nombre, admin.correo, hash, admin.rol], (err, result) => {
    if (err) throw err;
    console.log('Usuario administrador insertado');
    connection.end();
  });
});
