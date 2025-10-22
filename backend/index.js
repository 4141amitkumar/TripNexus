const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes'); // Assuming you have this
const tripRoutes = require('./routes/tripRoutes'); // Import trip routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001; // Use a different port than frontend

// --- Middleware ---
app.use(cors()); // Allow requests from your frontend
app.use(express.json()); // Parse JSON request bodies

// --- Routes ---
app.get('/', (req, res) => {
  res.send('TripNexus Backend is running!');
});

app.use('/api/auth', authRoutes); // Mount auth routes (if you have them)
app.use('/api/trips', tripRoutes); // Mount trip-related routes under /api/trips

// --- Error Handling (Basic Example) ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
