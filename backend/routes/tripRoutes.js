const express = require('express');
const router = express.Router();
const db = require('../db/db');
// Import the authentication middleware
const authMiddleware = require('../middleware/authMiddleware');
const recommendationService = require('../services/recommendationService');
const logger = require('../utils/logger');

// Apply the middleware to all routes in this file
// Any request to a route defined below this line will first go through authMiddleware
router.use(authMiddleware);

// --- Generate a new trip plan ---
router.post('/plan', async (req, res) => {
    // Because of the middleware, we can safely access req.user
    const userId = req.user.id;
    const { startCity, endCity, startDate, endDate, budget, preferences } = req.body;

    if (!startCity || !endCity || !startDate || !endDate || !budget) {
        return res.status(400).json({ message: "Please provide all required trip details." });
    }

    try {
        const tripDetails = {
            userId,
            startCity,
            endCity,
            startDate,
            endDate,
            budget,
            preferences,
        };
        const generatedPlan = await recommendationService.generateTripPlan(tripDetails);

        res.status(201).json(generatedPlan);
    } catch (error) {
        logger.error('Error in /plan route:', error);
        res.status(500).json({ message: 'Failed to generate trip plan.', error: error.message });
    }
});

// --- Get all trips for a user ---
router.get('/trips/:userId', async (req, res) => {
    // Ensure the user is requesting their own trips
    if (parseInt(req.params.userId, 10) !== req.user.id) {
        return res.status(403).json({ message: 'You are not authorized to view these trips.' });
    }

    try {
        const [trips] = await db.query(
            'SELECT trip_id, end_city, start_date, end_date FROM Trips WHERE user_id = ? ORDER BY start_date DESC',
            [req.user.id]
        );
        res.json(trips);
    } catch (error) {
        logger.error('Error fetching user trips:', error);
        res.status(500).json({ message: 'Failed to fetch trips.' });
    }
});

// --- Get details for a single trip ---
router.get('/:tripId', async (req, res) => {
    const { tripId } = req.params;

    try {
        const [trips] = await db.query('SELECT * FROM Trips WHERE trip_id = ? AND user_id = ?', [tripId, req.user.id]);
        if (trips.length === 0) {
            return res.status(404).json({ message: 'Trip not found or you do not have permission to view it.' });
        }

        const [days] = await db.query('SELECT * FROM TripDays WHERE trip_id = ? ORDER BY day_date ASC', [tripId]);
        const [activities] = await db.query('SELECT * FROM TripDayActivities WHERE trip_id = ? ORDER BY start_time ASC', [tripId]);

        // Structure the response
        const tripDetails = {
            ...trips[0],
            days: days.map(day => ({
                ...day,
                activities: activities.filter(activity => new Date(activity.day_date).getTime() === new Date(day.day_date).getTime()),
            })),
        };

        res.json(tripDetails);
    } catch (error) {
        logger.error(`Error fetching details for trip ${tripId}:`, error);
        res.status(500).json({ message: 'Failed to fetch trip details.' });
    }
});


module.exports = router;

