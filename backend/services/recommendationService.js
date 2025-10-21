const path = require('path');
const pool = require(path.join(__dirname, '..', 'db.js')); // Using robust path joining
const { AppError } = require('../utils/errors');

const getRecommendations = async (preferences) => {
    const {
        source,
        destination,
        budget,
        days,
        groupType,
        interests
    } = preferences;

    let query = `
        SELECT
            t.trip_id,
            t.trip_name,
            d.destination_name,
            d.description,
            d.image_url,
            t.price,
            t.duration_days,
            t.trip_type,
            (
                SELECT GROUP_CONCAT(i.interest_name SEPARATOR ', ')
                FROM TripInterests ti
                JOIN Interests i ON ti.interest_id = i.interest_id
                WHERE ti.trip_id = t.trip_id
            ) AS interests
        FROM Trips t
        JOIN Destinations d ON t.destination_id = d.destination_id
        WHERE 1=1
    `;
    
    const queryParams = [];

    if (budget) {
        query += ' AND t.price <= ?';
        queryParams.push(budget);
    }

    if (days) {
        query += ' AND t.duration_days <= ?';
        queryParams.push(days);
    }
    
    if (groupType) {
        query += ' AND t.trip_type = ?';
        queryParams.push(groupType);
    }

    if (destination) {
        query += ' AND d.destination_name LIKE ?';
        queryParams.push(`%${destination}%`);
    }

    if (interests && interests.length > 0) {
        query += `
            AND t.trip_id IN (
                SELECT ti.trip_id
                FROM TripInterests ti
                JOIN Interests i ON ti.interest_id = i.interest_id
                WHERE i.interest_name IN (?)
            )
        `;
        queryParams.push(interests);
    }
    
    query += ' LIMIT 20;';

    try {
        const [rows] = await pool.query(query, queryParams);
        if (rows.length === 0) {
            throw new AppError('No trips found matching your criteria. Please try different options.', 404);
        }
        return rows;
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('Failed to retrieve recommendations due to a server error.', 500);
    }
};

module.exports = {
    getRecommendations
};

