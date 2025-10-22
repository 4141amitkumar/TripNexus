const express = require('express');
const router = express.Router();
const pool = require('../db/db'); // Import the database connection pool
const { authMiddleware } = require('../middleware/authMiddleware'); // Assuming you might need auth later

// --- GET All Destinations ---
router.get('/destinations', async (req, res) => {
    // No specific SQL skills needed here, just fetching all.
    // More complex queries will come later.
    const sqlQuery = 'SELECT destination_id, name, country, region, description, best_time_to_visit FROM destinations ORDER BY name;'; // Select specific columns & order

    try {
        const [results] = await pool.query(sqlQuery);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching destinations:', error);
        res.status(500).json({ message: 'Error fetching destinations from database' });
    }
});


// --- POST /api/trips/plan (Example - Keep existing routes) ---
// Keep your existing '/plan' route here
router.post('/plan', authMiddleware, async (req, res) => {
    // ... (keep your existing trip planning logic)
    // Example: const { destination, startDate, endDate, preferences } = req.body;
    // Example: const userId = req.user.uid; // Assuming authMiddleware adds user info

    // --- Example of Inserting a Trip ---
    // const insertTripSql = 'INSERT INTO trips (user_id, destination_id, trip_name, start_date, end_date) VALUES (?, ?, ?, ?, ?)';
    // const destinationId = 1; // You'd look this up based on 'destination' name
    // const tripName = `Trip to ${destination}`;

    try {
        // --- Placeholder ---
        // You would eventually add SQL INSERT statements here for trips, itineraries etc.
        // const [result] = await pool.query(insertTripSql, [userId, destinationId, tripName, startDate, endDate]);
        // const tripId = result.insertId;

        // --- Dummy Response (Replace with actual plan generation later) ---
        console.log('Received trip plan request:', req.body);
        res.status(200).json({
            message: "Trip plan request received. Backend logic pending.",
            // tripId: tripId, // Send back the ID of the created trip
            plan: [
                { day: 1, date: req.body.startDate, activities: ["Placeholder activity 1", "Placeholder activity 2"] },
                // ... more days
            ]
        });
        // --- End Dummy Response ---

    } catch (error) {
        console.error('Error planning trip:', error);
        res.status(500).json({ message: 'Error saving trip data' });
    }
});

// --- GET User's Trips (Example) ---
router.get('/', authMiddleware, async (req, res) => {
    const userId = req.user.uid; // Get user ID from authenticated request
    // Basic SQL query to get trips for the logged-in user, joining with destinations
    const sqlQuery = `
        SELECT
            t.trip_id,
            t.trip_name,
            t.start_date,
            t.end_date,
            d.name as destination_name,
            d.country as destination_country
        FROM trips t
        JOIN destinations d ON t.destination_id = d.destination_id
        WHERE t.user_id = ?
        ORDER BY t.start_date DESC;
    `;
    try {
        const [trips] = await pool.query(sqlQuery, [userId]);
        res.status(200).json(trips);
    } catch (error) {
        console.error('Error fetching user trips:', error);
        res.status(500).json({ message: 'Failed to retrieve trips' });
    }
});


// --- GET Specific Trip Details (Example) ---
router.get('/:tripId', authMiddleware, async (req, res) => {
    const userId = req.user.uid;
    const tripId = req.params.tripId;

    // More complex query: Get trip info, itinerary days, and items with POI details
    // Using LEFT JOINs to include days/items even if they don't have associated POIs yet
    const sqlQuery = `
        SELECT
            t.trip_id, t.trip_name, t.start_date, t.end_date,
            d.name as destination_name, d.country as destination_country,
            i.itinerary_id, i.day_number, i.date as itinerary_date, i.notes as day_notes,
            ii.item_id, ii.start_time, ii.end_time, ii.custom_activity_description, ii.notes as item_notes,
            poi.poi_id, poi.name as poi_name, poi.category as poi_category, poi.description as poi_description,
            poi.address as poi_address, poi.opening_hours as poi_opening_hours
        FROM trips t
        JOIN destinations d ON t.destination_id = d.destination_id
        LEFT JOIN itineraries i ON t.trip_id = i.trip_id
        LEFT JOIN itinerary_items ii ON i.itinerary_id = ii.itinerary_id
        LEFT JOIN points_of_interest poi ON ii.poi_id = poi.poi_id
        WHERE t.user_id = ? AND t.trip_id = ?
        ORDER BY i.day_number, ii.start_time;
    `;

    try {
        const [results] = await pool.query(sqlQuery, [userId, tripId]);
        if (results.length === 0) {
            return res.status(404).json({ message: 'Trip not found or access denied.' });
        }

        // --- Process results into a structured format ---
        // (You'll likely want a helper function for this)
        const tripDetails = {
            trip_id: results[0].trip_id,
            trip_name: results[0].trip_name,
            start_date: results[0].start_date,
            end_date: results[0].end_date,
            destination_name: results[0].destination_name,
            destination_country: results[0].destination_country,
            itinerary: []
        };
        const itineraryMap = new Map();

        results.forEach(row => {
            if (row.itinerary_id) {
                let day = itineraryMap.get(row.itinerary_id);
                if (!day) {
                    day = {
                        itinerary_id: row.itinerary_id,
                        day_number: row.day_number,
                        date: row.itinerary_date,
                        notes: row.day_notes,
                        items: []
                    };
                    itineraryMap.set(row.itinerary_id, day);
                }
                if (row.item_id) {
                    day.items.push({
                        item_id: row.item_id,
                        start_time: row.start_time,
                        end_time: row.end_time,
                        custom_activity_description: row.custom_activity_description,
                        notes: row.item_notes,
                        poi: row.poi_id ? {
                            poi_id: row.poi_id,
                            name: row.poi_name,
                            category: row.poi_category,
                            description: row.poi_description,
                            address: row.poi_address,
                            opening_hours: row.poi_opening_hours
                        } : null
                    });
                }
            }
        });
        tripDetails.itinerary = Array.from(itineraryMap.values());
        // --- End processing ---

        res.status(200).json(tripDetails);
    } catch (error) {
        console.error(`Error fetching details for trip ${tripId}:`, error);
        res.status(500).json({ message: 'Failed to retrieve trip details' });
    }
});


module.exports = router;
