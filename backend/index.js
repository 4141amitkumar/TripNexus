require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const pool = require("./db");
const services = require("./services/recommendationService"); // Correctly import the exported services object
const { ValidationError } = require("./utils/errors");

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.post("/api/recommend", async (req, res, next) => {
  const startTime = Date.now();
  console.log('Received recommendation request:', req.body);
  try {
    // Use the correctly imported service
    const recommendations = await services.recommendationService.getRecommendations(req.body);
    const processingTime = Date.now() - startTime;
    res.json({
      success: true,
      metadata: {
        engine_version: "8.1-Stable",
        processing_time_ms: processingTime,
        results_count: recommendations.length,
      },
      recommendations,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/destination/:id", async (req, res, next) => {
    try {
        // Use the correctly imported service
        const details = await services.destinationDetailService.getDestinationDetails(req.params.id, req.query);
        res.json({ success: true, data: details });
    } catch (error) {
        next(error);
    }
});


app.get("/health", (req, res) => res.status(200).send("OK"));

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("🚨 An error occurred:", err);

  if (err instanceof ValidationError) {
    return res.status(400).json({ success: false, message: err.message });
  }

  res.status(500).json({
    success: false,
    message: "Something went wrong on our end.",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 TripNexus backend running on http://localhost:${PORT}`);
});

