// db.js
const mysql = require("mysql2/promise");
require("dotenv").config();

console.log("🚀 Initializing Database Connection Pool for Local Development...");

const dbConfig = {
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  connectTimeout: 60000,
  charset: 'utf8mb4',
  timezone: '+00:00',
};

// Configuration for local development
const pool = mysql.createPool({
  ...dbConfig,
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "tripnexus",
  port: process.env.DB_PORT || 3306,
});

console.log(`🔗 Connecting to Local MySQL on: ${process.env.DB_HOST || "localhost"}`);


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
