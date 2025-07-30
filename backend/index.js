const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

/* ===============================
   MySQL Connection
================================*/
let pool;

if (process.env.DATABASE_URL || process.env.MYSQL_URL) {
  // Railway MYSQL_URL parsing
  const url = new URL(process.env.DATABASE_URL || process.env.MYSQL_URL);

  pool = mysql.createPool({
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    port: url.port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  console.log("🔗 Connecting with Railway MYSQL_URL");
  console.log("DB Config:", {
    host: url.hostname,
    user: url.username,
    database: url.pathname.slice(1),
    port: url.port,
  });

} else {
  // Local dev fallback
  pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "tripnexus",
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  console.log("🔗 Connecting with local .env config");
  console.log("DB Config:", {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });
}

// ✅ Test DB connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully!");
    connection.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
})();

/* ===============================
   USERS CRUD API
================================*/
app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    console.error("Fetch users error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    let {
      email,
      password_hash = null,
      first_name,
      last_name = "",
      age = null,
      gender = "Prefer not to say",
      phone = null,
      country = null,
      state = null,
      city = null,
      latitude = null,
      longitude = null,
      preferred_budget_min = null,
      preferred_budget_max = null,
      mobility_level = null,
      is_active = 1,
    } = req.body;

    if (!first_name || !email) {
      return res.status(400).json({ error: "First name and email are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO users (
        user_id, email, password_hash, first_name, last_name, age, gender, phone,
        country, state, city, latitude, longitude, preferred_budget_min,
        preferred_budget_max, mobility_level, is_active
      ) VALUES (
        UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )`,
      [
        email,
        password_hash,
        first_name,
        last_name,
        age,
        gender,
        phone,
        country,
        state,
        city,
        latitude,
        longitude,
        preferred_budget_min,
        preferred_budget_max,
        mobility_level,
        is_active,
      ]
    );

    res.json({
      message: "User added successfully",
      id: result.insertId,
      email,
      first_name,
      last_name,
    });
  } catch (err) {
    console.error("Add user error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/api/users/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const updates = req.body;

  try {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updates);

    await pool.query(`UPDATE users SET ${fields} WHERE user_id = ?`, [
      ...values,
      user_id,
    ]);

    res.json({ message: "User updated successfully", user_id });
  } catch (err) {
    console.error("Update user error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/api/users/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    await pool.query("DELETE FROM users WHERE user_id = ?", [user_id]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

/* ===============================
   Recommendation API
================================*/
app.post("/api/recommend", async (req, res) => {
  const {
    departure_lat,
    departure_lng,
    age,
    gender,
    budget,
    tourist_type,
    travel_month_num,
    preferred_type,
    duration_days,
  } = req.body;

  try {
    const [rows] = await pool.query(
      `
        SELECT
            d.destination_id,
            d.name AS destination_name,
            dc.category_name,
            (
                (d.overall_rating / 5.0) * 25 +
                COALESCE(sw.weather_score / 10.0, 0.7) * 20 +
                CASE
                    WHEN ST_Distance_Sphere(POINT(?, ?), POINT(d.longitude, d.latitude))/1000 <= 500 THEN 15
                    WHEN ST_Distance_Sphere(POINT(?, ?), POINT(d.longitude, d.latitude))/1000 <= 1000 THEN 12
                    WHEN ST_Distance_Sphere(POINT(?, ?), POINT(d.longitude, d.latitude))/1000 <= 2000 THEN 8
                    ELSE 4
                END +
                CASE
                    WHEN ? = 'Couple' AND ? >= 60 THEN (dc.romance_score / 10.0) * (CASE WHEN dc.physical_demand_level <= 2 THEN 1.0 ELSE 0.5 END) * 15
                    WHEN ? = 'Couple' AND ? < 30 THEN (dc.romance_score / 10.0) * (dc.adventure_level / 10.0) * 15
                    WHEN ? = 'Couple' THEN (dc.romance_score / 10.0) * 15
                    WHEN ? = 'Family' THEN (dc.family_friendliness / 10.0) * (CASE WHEN dc.physical_demand_level <= 3 THEN 1.0 ELSE 0.7 END) * 15
                    WHEN ? = 'Solo' AND ? <= 30 THEN (dc.adventure_level / 10.0) * 15
                    WHEN ? = 'Solo' AND ? > 30 THEN ((dc.cultural_richness + dc.adventure_level) / 20.0) * 15
                    WHEN ? = 'Friends' THEN (dc.adventure_level / 10.0) * 15
                    ELSE 10
                END +
                CASE
                    WHEN (
                        (d.entry_fee * ?) +
                        COALESCE(h.avg_price, 2500) * ? +
                        (ST_Distance_Sphere(POINT(?, ?), POINT(d.longitude, d.latitude))/1000 * 8)
                    ) <= ? THEN 10
                    WHEN (
                        (d.entry_fee * ?) +
                        COALESCE(h.avg_price, 2500) * ? +
                        (ST_Distance_Sphere(POINT(?, ?), POINT(d.longitude, d.latitude))/1000 * 8)
                    ) <= ? * 1.2 THEN 7
                    WHEN (
                        (d.entry_fee * ?) +
                        COALESCE(h.avg_price, 2500) * ? +
                        (ST_Distance_Sphere(POINT(?, ?), POINT(d.longitude, d.latitude))/1000 * 8)
                    ) <= ? * 1.5 THEN 4
                    ELSE 1
                END
            ) AS overall_score,
            d.overall_rating AS rating_score,
            COALESCE(sw.weather_score / 10.0, 0.7) * 20 AS weather_score,
            d.latitude,
            d.longitude,
            (
                (d.entry_fee * ?) +
                COALESCE(h.avg_price, 2500) * ? +
                (ST_Distance_Sphere(POINT(?, ?), POINT(d.longitude, d.latitude))/1000 * 8)
            ) AS estimated_total_cost
        FROM destinations d
        JOIN destination_categories dc ON d.category_id = dc.category_id
        LEFT JOIN seasonal_weather sw ON d.destination_id = sw.destination_id AND sw.month = ?
        LEFT JOIN (
            SELECT
                destination_id,
                AVG((price_per_night_min + price_per_night_max) / 2) AS avg_price
            FROM hotels
            WHERE is_active = TRUE
            GROUP BY destination_id
        ) h ON d.destination_id = h.destination_id
        WHERE d.is_active = TRUE
            AND dc.category_name = ?
            AND (? < 65 OR dc.physical_demand_level <= 3)
            AND (? != 'Family' OR dc.category_name != 'Extreme Adventures')
        ORDER BY overall_score DESC
        LIMIT 20;
      `,
      [
        departure_lng, departure_lat,
        departure_lng, departure_lat,
        departure_lng, departure_lat,
        tourist_type, age,
        tourist_type, age,
        tourist_type,
        tourist_type,
        tourist_type, age,
        tourist_type, age,
        tourist_type,
        duration_days, duration_days,
        departure_lng, departure_lat, budget,
        duration_days, duration_days,
        departure_lng, departure_lat, budget,
        duration_days, duration_days,
        departure_lng, departure_lat, budget,
        duration_days, duration_days,
        departure_lng, departure_lat,
        travel_month_num,
        preferred_type,
        age, tourist_type
      ]
    );

    res.json(rows);
  } catch (err) {
    console.error("Recommendation Query Error:", err.message);
    res.status(500).json({ error: "Database error while fetching recommendations." });
  }
});

/* ===============================
   Destination Details & Distance APIs
================================*/
app.get("/api/destination/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await pool.query("SELECT * FROM destinations WHERE destination_id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Destination not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("MySQL Destination Fetch Error:", err.message);
    res.status(500).json({ error: "Database error while fetching destination." });
  }
});

app.post("/api/distance", async (req, res) => {
  const { origin, destination } = req.body;
  if (!origin || !destination)
    return res.status(400).json({ error: "Origin and destination required" });

  try {
    const response = await axios.get("https://maps.googleapis.com/maps/api/distancematrix/json", {
      params: {
        origins: `${origin.lat},${origin.lng}`,
        destinations: destination,
        key: process.env.GOOGLE_MAPS_API_KEY,
        mode: "driving",
      },
    });
    const element = response.data.rows[0].elements[0];
    if (element.status !== "OK")
      return res.status(500).json({ error: "Distance data not found" });

    const distanceKm = element.distance.value / 1000;
    const duration = element.duration.text;
    const travelCost = Math.ceil(distanceKm * 8);

    res.json({ distanceKm, duration, travelCost, mode: "Driving" });
  } catch (err) {
    console.error("Distance API error:", err.message);
    res.status(500).json({ error: "Failed to fetch distance" });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
