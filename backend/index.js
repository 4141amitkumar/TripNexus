// index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const pool = require('./db'); // Import the database pool
const recommendationService = require('./services/recommendationService'); // Import the recommendation logic

const app = express();
const PORT = process.env.PORT || 8080;

// --- Middleware Setup ---
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:4000" || "https://trip-nexus.vercel.app",
  credentials: true
}));
app.use(bodyParser.json());

// --- API Routes ---

/**
 * @route POST /api/recommend
 * @description The main endpoint to get travel recommendations.
 * It uses a hybrid approach: fetches candidates with SQL, then scores them in Node.js.
 */
app.post("/api/recommend", async (req, res, next) => {
  const startTime = Date.now();
  try {
    // Basic validation
    const requiredFields = ['departure_lat', 'departure_lng', 'age', 'budget', 'duration_days', 'tourist_type'];
    for (const field of requiredFields) {
      if (req.body[field] === undefined) {
        return res.status(400).json({ success: false, error: `Missing required field: ${field}` });
      }
    }

    const recommendations = await recommendationService.getRecommendations(req.body);
    
    const processingTime = Date.now() - startTime;
    console.log(`✅ Request processed successfully in ${processingTime}ms.`);
    
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
    // Forward error to the centralized error handler
    next(error);
  }
});

/**
 * @route GET /health
 * @description A health check endpoint to verify service status.
 */
app.get("/health", async (req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "UP", database: "Connected" });
  } catch (error) {
    next(error);
  }
});

// --- Centralized Error Handling ---

// 404 Handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: `Not Found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("🚨 An error occurred:", {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : 'stack hidden in production',
  });
  
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: process.env.NODE_ENV === 'development' ? err.message : "Something went wrong on our end.",
  });
});

// --- Server Startup ---
app.listen(PORT, () => {
  console.log(`\n🚀 TripNexus Interview-Ready Backend is live on http://localhost:${PORT}`);
  console.log("🔥 Using Hybrid SQL + Node.js Recommendation Engine.");
  console.log("--------------------------------------------------\n");
});
