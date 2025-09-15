// backend/db.js
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

function buildSSL() {
  // Opción A: en Render pon el contenido del CA en la env DB_CA
  if (process.env.DB_CA) return { ca: process.env.DB_CA };

  // Opción B: sube ca.pem al repo y apunta con SSL_CERT=./ca.pem
  if (process.env.SSL_CERT) {
    const p = path.resolve(process.env.SSL_CERT);
    if (fs.existsSync(p)) return { ca: fs.readFileSync(p) };
  }

  // Si Railway exige SSL, asegúrate de no dejarlo undefined
  return undefined;
}

let pool;

async function initPool(retries = 5) {
  if (pool) return pool;

  const ssl = buildSSL();

  for (let i = 0; i < retries; i++) {
    try {
      pool = mysql.createPool({
        host: process.env.DB_HOST,                // *.proxy.rlwy.net
        port: Number(process.env.DB_PORT),        // puerto proxy externo
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl,                                      // { ca: ... }
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 30000,                    // 30s
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      });

      // Probar conexión
      await pool.query('SELECT 1');
      console.log('Pool MySQL listo');
      break;
    } catch (err) {
      console.error(`Intento ${i + 1} DB falló:`, err.code || err.message);
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 2000 * (i + 1))); // backoff
    }
  }

  // Ping periódico para evitar cierre por inactividad del proxy
  setInterval(() => {
    pool.query('SELECT 1').catch(e =>
      console.warn('Ping DB falló:', e.code || e.message)
    );
  }, 50000);

  // Evitar que un error del pool tumbe el proceso
  pool.on?.('error', (e) => {
    console.error('Pool error:', e);
  });

  return pool;
}

module.exports = { initPool };
