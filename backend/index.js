require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const pool = require("./db"); // DB connection pool
const recommendationService = require("./services/recommendationService"); // Recommendation logic

const app = express();
const PORT = process.env.PORT || 8080;

// Global error handlers to catch crashes
process.on("unhandledRejection", (err) => {
  console.error("🔥 UNHANDLED REJECTION:", err);
});
process.on("uncaughtException", (err) => {
  console.error("🔥 UNCAUGHT EXCEPTION:", err);
});

// --- Middleware Setup ---
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(",") || [
      process.env.FRONTEND_URL,
      "http://localhost:4000",
      "https://trip-nexus.vercel.app",
    ],
    credentials: true,
  })
);
app.use(bodyParser.json());

// --- Routes ---

/**
 * @route POST /api/recommend
 * @description Main endpoint for travel recommendations.
 */
app.post("/api/recommend", async (req, res, next) => {
  const startTime = Date.now();
  try {
    const requiredFields = [
      "departure_lat",
      "departure_lng",
      "age",
      "budget",
      "duration_days",
      "tourist_type",
    ];
    for (const field of requiredFields) {
      if (req.body[field] === undefined) {
        return res
          .status(400)
          .json({ success: false, error: `Missing required field: ${field}` });
      }
    }

    const recommendations = await recommendationService.getRecommendations(
      req.body
    );

    const processingTime = Date.now() - startTime;
    console.log(`✅ Request processed in ${processingTime}ms.`);

    res.json({
      success: true,
      metadata: {
        engine_version: "8.0-Hybrid",
        processing_time_ms: processingTime,
        results_count: recommendations.length,
      },
      recommendations,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /health
 * @description Service health check.
 */
app.get("/health", async (req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "UP", database: "Connected" });
  } catch (error) {
    next(error);
  }
});

// --- Error Handling ---
app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, error: `Not Found: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res) => {
  console.error("🚨 ERROR:", err.message);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong on our end.",
  });
});

// --- Start server after DB connection test ---
(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log("✅ Database Connected!");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 TripNexus backend running on port ${PORT}`);
      console.log("🔥 Using Hybrid SQL + Node.js Recommendation Engine.");
      console.log("--------------------------------------------------\n");
    });
  } catch (err) {
    console.error("❌ FATAL: Database connection failed.", err);
    process.exit(1); // Railway will restart container
  }
})();
