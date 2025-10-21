const db = require('../db/db');
const logger = require('../utils/logger');

class RecommendationService {
    async generateTripPlan(tripDetails) {
        const { userId, startCity, endCity, startDate, endDate, budget, preferences } = tripDetails;
        
        // 1. Fetch Destination City Info
        const [cities] = await db.query('SELECT * FROM Cities WHERE name = ?', [endCity]);
        if (cities.length === 0) {
            throw new Error(`Destination city '${endCity}' not found in our database.`);
        }
        const destination = cities[0];

        // 2. Calculate trip duration
        const tripStartDate = new Date(startDate);
        const tripEndDate = new Date(endDate);
        const durationDays = Math.ceil((tripEndDate - tripStartDate) / (1000 * 60 * 60 * 24)) + 1;

        // 3. Create and Save the main Trip record
        const tripData = {
            user_id: userId,
            start_city: startCity,
            end_city: endCity,
            start_date: tripStartDate,
            end_date: tripEndDate,
            budget: budget,
            preferences: JSON.stringify(preferences)
        };

        const [tripResult] = await db.query('INSERT INTO Trips SET ?', tripData);
        const tripId = tripResult.insertId;

        // 4. Generate Day-by-Day Plan
        const attractions = destination.popular_attractions.split(',').map(a => a.trim());
        const dailyBudget = budget / durationDays;
        
        let plan = [];

        for (let i = 0; i < durationDays; i++) {
            const currentDate = new Date(tripStartDate);
            currentDate.setDate(tripStartDate.getDate() + i);

            // Save the day record
            const dayData = { trip_id: tripId, day_date: currentDate, notes: `Day ${i + 1} in ${endCity}`};
            const [dayResult] = await db.query('INSERT INTO TripDays SET ?', dayData);
            const dayId = dayResult.insertId;
            
            // For simplicity, let's plan 2 activities per day.
            // A real-world app would have more complex logic based on preferences, opening hours, etc.
            let dayActivities = [];
            const activity1Index = i * 2 % attractions.length;
            const activity2Index = (i * 2 + 1) % attractions.length;

            if (attractions[activity1Index]) {
                 const activity1 = {
                    trip_id: tripId,
                    day_id: dayId,
                    day_date: currentDate,
                    activity_name: attractions[activity1Index],
                    start_time: '10:00:00',
                    end_time: '13:00:00',
                    estimated_cost: Math.min(50, dailyBudget / 4), // Placeholder cost
                };
                await db.query('INSERT INTO TripDayActivities SET ?', activity1);
                dayActivities.push(activity1);
            }
           
            if (attractions[activity2Index] && activity1Index !== activity2Index) {
                 const activity2 = {
                    trip_id: tripId,
                    day_id: dayId,
                    day_date: currentDate,
                    activity_name: attractions[activity2Index],
                    start_time: '15:00:00',
                    end_time: '18:00:00',
                    estimated_cost: Math.min(70, dailyBudget / 3), // Placeholder cost
                };
                await db.query('INSERT INTO TripDayActivities SET ?', activity2);
                dayActivities.push(activity2);
            }

            plan.push({
                day: i + 1,
                date: currentDate.toISOString().split('T')[0],
                activities: dayActivities,
            });
        }

        logger.info(`Generated plan for trip ID: ${tripId}`);
        return { tripId, plan };
    }
}

module.exports = new RecommendationService();
