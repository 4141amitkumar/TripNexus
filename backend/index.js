require('dotenv').config(); // Loads variables from backend/.env
const express = require('express');
const cors = require('cors');
const bodyParser = 'body-parser'; // Note: express.json() is now preferred
const tripRoutes = require('./routes/tripRoutes');
const authRoutes = require('./routes/authRoutes');
const { AppError, globalErrorHandler } = require('./utils/errors');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 4001;

// --- Middleware ---
// Enable Cross-Origin Resource Sharing for your React app
app.use(cors());
// Parse incoming JSON requests
app.use(express.json());
// Log each incoming request
app.use((req, res, next) => {
  logger.info(`Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

// --- API Routes ---
app.use('/api/trips', tripRoutes); // All trip-related routes are in tripRoutes.js
app.use('/api/auth', authRoutes); // All auth-related routes

// --- Error Handling ---
// Handle 404 errors for any API route not found
app.all('/api/*', (req, res, next) => {
  next(new AppError(`The requested URL was not found on this server: ${req.originalUrl}`, 404));
});

// Global error handler catches all errors passed by next(error)
app.use(globalErrorHandler);

// --- Start Server ---
app.listen(PORT, () => {
  logger.info(`🚀 Server is listening on http://localhost:${PORT}`);
});

