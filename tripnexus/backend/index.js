const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config(); // Load environment variables

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Load destinations data
const destinations = require("./destinationsData");

// Route: POST /api/recommend
app.post("/api/recommend", (req, res) => {
  const { month, type, budget } = req.body;

  const filtered = destinations.filter((place) => {
    const matchesType = place.type === type;
    const matchesMonth = place.months.includes(month);
    const withinBudget = place.estimatedCost <= budget;
    return matchesType && matchesMonth && withinBudget;
  });

  res.json(filtered);
});

// Route: GET /api/destination/:id
app.get("/api/destination/:id", (req, res) => {
  const id = req.params.id;
  const place = destinations.find((p) => p.id === id);

  if (!place) return res.status(404).json({ error: "Destination not found" });
  res.json(place);
});

// Route: POST /api/distance
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
    const travelCost = Math.ceil(distanceKm * 8); // ₹8/km simple estimate

    res.json({
      distanceKm,
      duration,
      travelCost,
      mode: "Driving"
    });

  } catch (err) {
    console.error("Distance API error:", err.message);
    res.status(500).json({ error: "Failed to fetch distance" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
