const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// ✅ MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root", // apna MySQL user
  password: "YOUR_PASSWORD", // jo set kiya tha
  database: "tripnexus", // Workbench me banaya database
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/* ===============================
   USERS CRUD API
================================*/

// Get all users
app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    console.error("Fetch users error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// Add new user
app.post("/api/users", async (req, res) => {
  const { name, email } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO users (name, email) VALUES (?, ?)",
      [name, email]
    );
    res.json({ id: result.insertId, name, email });
  } catch (err) {
    console.error("Add user error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// Update user
app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    await pool.query(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name, email, id]
    );
    res.json({ id, name, email });
  } catch (err) {
    console.error("Update user error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// Delete user
app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

/* ===============================
   Existing routes (recommendations, distance, etc.)
================================*/

app.post("/api/recommend", async (req, res) => {
  const { month, type, budget } = req.body;
  try {
    const [rows] = await pool.query(
      `SELECT * FROM destinations 
       WHERE type = ? 
         AND FIND_IN_SET(?, months) 
         AND estimatedCost <= ?`,
      [type, month, budget]
    );
    res.json(rows);
  } catch (err) {
    console.error("MySQL Recommend Error:", err.message);
    res.status(500).json({ error: "Database error while fetching recommendations." });
  }
});

app.get("/api/destination/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await pool.query("SELECT * FROM destinations WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Destination not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("MySQL Destination Fetch Error:", err.message);
    res.status(500).json({ error: "Database error while fetching destination." });
  }
});

app.post("/api/distance", async (req, res) => {
  const { origin, destination } = req.body;
  if (!origin || !destination) {
    return res.status(400).json({ error: "Origin and destination required" });
  }
  try {
    const response = await axios.get("https://maps.googleapis.com/maps/api/distancematrix/json", {
      params: {
        origins: `${origin.lat},${origin.lng}`,
        destinations: destination,
        key: process.env.GOOGLE_MAPS_API_KEY,
        mode: "driving"
      }
    });
    const data = response.data;
    const element = data.rows[0].elements[0];
    if (element.status !== "OK") {
      return res.status(500).json({ error: "Distance data not found" });
    }
    const distanceKm = element.distance.value / 1000;
    const duration = element.duration.text;
    const travelCost = Math.ceil(distanceKm * 8);
    res.json({ distanceKm, duration, travelCost, mode: "Driving" });
  } catch (err) {
    console.error("Distance API error:", err.message);
    res.status(500).json({ error: "Failed to fetch distance" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
