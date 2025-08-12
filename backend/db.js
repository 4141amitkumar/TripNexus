// db.js
const mysql = require("mysql2/promise");
require("dotenv").config();

console.log("🚀 Initializing Database Connection Pool...");

const dbConfig = {
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  charset: 'utf8mb4',
  timezone: '+00:00',
};

let pool;

if (process.env.DATABASE_URL) {
  // For Railway or other cloud providers
  const url = new URL(process.env.DATABASE_URL);
  pool = mysql.createPool({
    ...dbConfig,
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    port: url.port || 3306,
    ssl: { rejectUnauthorized: false } // Required for many cloud DBs
  });
  console.log(`🔗 Connecting to Cloud MySQL on: ${url.hostname}`);
} else {
  // For local development
  pool = mysql.createPool({
    ...dbConfig,
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "tripnexus",
    port: process.env.DB_PORT || 3306,
  });
  console.log(`🔗 Connecting to Local MySQL on: ${process.env.DB_HOST || "localhost"}`);
}

// Test connection and export pool
(async () => {
  try {
    const connection = await pool.getConnection();
    const [versionResult] = await connection.execute('SELECT VERSION() as version');
    console.log(`✅ Database Connected! MySQL Version: ${versionResult[0].version}`);
    connection.release();
  } catch (err) {
    console.error("❌ FATAL: Database connection failed.", err);
    process.exit(1);
  }
})();

module.exports = pool;
