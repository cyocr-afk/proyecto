// db.js
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first'); // evita intentos IPv6 que a veces timeoutean

require('dotenv').config();
const mysql = require('mysql2/promise');

function makePool() {
  return mysql.createPool({
    host: process.env.DB_HOST,               // shortline.proxy.rlwy.net
    port: Number(process.env.DB_PORT || 3306), // 17804
    user: process.env.DB_USER,               // root (o el que tengas en Railway)
    password: process.env.DB_PASSWORD,       // <-- asegúrate que sea la correcta
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 30000,        // 30s ayuda si la DB “despierta”
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // Deja TLS activo si tu endpoint lo requiere:
    ssl: { rejectUnauthorized: false, minVersion: 'TLSv1.2' },
  });
}

// Singleton para evitar múltiples pools en hot reloads
const pool = global._mysqlPool || makePool();
if (process.env.NODE_ENV !== 'production') {
  global._mysqlPool = pool;
}

// Autotest al arrancar
(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('✅ MySQL pool listo');
  } catch (err) {
    console.error('❌ Fallo inicial de MySQL:', err);
  }
})();

// Manejo de rechazos no capturados para no tumbar el proceso
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

module.exports = pool;
