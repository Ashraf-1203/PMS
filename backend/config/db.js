const sql = require('mssql');
require('dotenv').config(); // Ensure environment variables are loaded

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true', // Use strict 'true' comparison
    trustServerCertificate: process.env.DB_OPTIONS_TRUST_SERVER_CERTIFICATE === 'true' // For local dev with self-signed cert
  }
};

let pool = null;

async function connect() {
  if (pool) {
    return pool; // Return existing pool if already connected
  }
  try {
    console.log('Attempting to connect to database with config:', {
      ...dbConfig,
      password: dbConfig.password ? '******' : undefined // Mask password for logging
    });
    pool = await new sql.ConnectionPool(dbConfig).connect();
    console.log('SQL Server Connected Successfully.');

    pool.on('error', err => {
      console.error('SQL Pool Error:', err);
      // Optionally try to reconnect or terminate
      pool = null; // Reset pool on error
    });

    return pool;
  } catch (err) {
    console.error('Database Connection Failed:', err.message);
    console.error('Full error object:', err);
    // Rethrow the error or handle it as per application needs
    // For example, you might want the application to exit if DB connection fails at startup
    process.exit(1); // Exit if cannot connect to DB
    // throw err;
  }
}

async function close() {
  if (pool) {
    try {
      await pool.close();
      pool = null;
      console.log('Database connection closed.');
    } catch (err) {
      console.error('Error closing database connection:', err.message);
    }
  }
}

// Utility function to get the pool, ensures connection is established.
async function getPool() {
  if (!pool) {
    return await connect();
  }
  return pool;
}

module.exports = {
  sql, // Export sql object for direct use (e.g. sql.NVarChar)
  connect,
  close,
  getPool
};
