const mysql = require('mysql2/promise'); // Use promise version for async/await
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' }); // Assuming .env is in the main project root, adjust if needed

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost', // Use environment variable or default
  user: process.env.DB_USER || 'root',      // Use environment variable or default
  password: process.env.DB_PASSWORD || '97951', // Replace with your password or use .env
  database: process.env.DB_NAME || 'tripnexus_new', // Use environment variable or default
  waitForConnections: true,
  connectionLimit: 10, // Adjust as needed
  queueLimit: 0
});

// Function to test the connection (optional)
async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Successfully connected to the database.');
    // You can also run a simple query like 'SELECT 1'
    // const [rows] = await connection.query('SELECT 1');
    // console.log('Test query successful:', rows);
  } catch (error) {
    console.error('Error connecting to the database:', error);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.error('Check your database username and password.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
        console.error(`Database '${process.env.DB_NAME || 'tripnexus'}' not found. Did you create it?`);
    }
  } finally {
    if (connection) {
      connection.release(); // IMPORTANT: Release the connection back to the pool
    }
  }
}

// Test connection when the module loads (optional)
// testConnection();

// Export the pool to be used in other parts of your backend
module.exports = pool;
