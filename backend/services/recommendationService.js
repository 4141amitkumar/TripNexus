// services/recommendationService.js
const pool = require('../db');

/**
 * Fetches candidate destinations from the database based on initial filters.
 * This query is optimized to be fast and avoid packet size issues.
 * @param {object} params - User's travel preferences.
 * @returns {Promise<Array>} A list of candidate destinations.
 */
const fetchCandidateDestinations = async (params) => {
  const { departure_lat, departure_lng, budget, travel_month_num, preferred_type, duration_days } = params;

  // This SQL query is intentionally kept lean.
  // Its only job is to fetch a pre-filtered list of candidates efficiently.
  const sql = `
    SELECT 
      d.destination_id, d.name AS destination_name, d.image_url, d.city, d.state,
      d.latitude, d.longitude, d.overall_rating, d.popularity_score, d.safety_score,
      dc.category_name, dc.physical_demand_level, dc.family_friendliness, 
      dc.romance_score, dc.adventure_level, dc.cultural_richness,
      sw.weather_score, sw.is_peak_season, sw.festival_season, sw.avg_temperature
    FROM destinations d
    INNER JOIN destination_categories dc ON d.category_id = dc.category_id
    LEFT JOIN seasonal_weather sw ON d.destination_id = sw.destination_id AND sw.month = ?
    WHERE d.is_active = 1
      AND (? IS NULL OR dc.category_name = ?)
      AND d.overall_rating >= 3.5
    ORDER BY d.popularity_score DESC, d.overall_rating DESC
    LIMIT 150;
  `;

  const [candidates] = await pool.execute(sql, [
    travel_month_num,
    preferred_type, preferred_type
  ]);
  
  console.log(`🔍 Phase 1: Fetched ${candidates.length} candidate destinations from DB.`);
  return candidates;
};

/**
 * Calculates a multi-dimensional score for each destination in JavaScript.
 * This avoids complex, large SQL queries and packet size errors.
 * @param {Array} candidates - The list of destinations from the DB.
 * @param {object} params - User's travel preferences.
 * @returns {Array} A list of scored and ranked destinations.
 */
const scoreAndRankDestinations = (candidates, params) => {
  const { departure_lat, departure_lng, age, budget, tourist_type, duration_days } = params;

  const scoredDestinations = candidates.map(dest => {
    // --- Scoring Logic (100 points total) ---
    
    // 1. Quality Score (30 points)
    const qualityScore = (dest.overall_rating / 5.0) * 30;

    // 2. Weather Score (20 points)
    const weatherScore = ((dest.weather_score || 7.5) / 10.0 * 15) + (dest.is_peak_season ? 5 : 0);

    // 3. Distance Score (15 points)
    const distanceKm = haversineDistance(departure_lat, departure_lng, dest.latitude, dest.longitude);
    let distanceScore = 0;
    if (distanceKm <= 300) distanceScore = 15;
    else if (distanceKm <= 700) distanceScore = 10;
    else if (distanceKm <= 1500) distanceScore = 5;
    else distanceScore = 2;

    // 4. Personalization Score (25 points) - The core logic
    let personalizationScore = 0;
    switch (tourist_type) {
      case 'Solo':
        personalizationScore = (dest.adventure_level * 1.0) + (dest.cultural_richness * 1.0) + (dest.safety_score * 0.5);
        break;
      case 'Couple':
        personalizationScore = (dest.romance_score * 1.5) + (dest.overall_rating * 1.0);
        break;
      case 'Family':
        personalizationScore = (dest.family_friendliness * 1.5) + (dest.safety_score * 1.0);
        break;
      case 'Friends':
        personalizationScore = (dest.adventure_level * 1.0) + (dest.popularity_score * 1.0) + 5;
        break;
      default:
        personalizationScore = 15;
    }
    
    // 5. Budget Score (10 points)
    const estimatedCost = (dest.avg_daily_food_cost || 1000) * duration_days + (distanceKm * 10); // Simple cost model
    let budgetScore = 0;
    if (estimatedCost <= budget * 0.8) budgetScore = 10;
    else if (estimatedCost <= budget * 1.1) budgetScore = 7;
    else if (estimatedCost <= budget * 1.5) budgetScore = 4;

    const finalScore = qualityScore + weatherScore + distanceScore + personalizationScore + budgetScore;
    
    return {
      ...dest,
      distance_km: Math.round(distanceKm),
      estimated_avg_cost: Math.round(estimatedCost),
      final_score: parseFloat(finalScore.toFixed(2)),
      scoring_breakdown: {
        quality: parseFloat(qualityScore.toFixed(2)),
        weather: parseFloat(weatherScore.toFixed(2)),
        distance: parseFloat(distanceScore.toFixed(2)),
        personalization: parseFloat(personalizationScore.toFixed(2)),
        budget: parseFloat(budgetScore.toFixed(2))
      }
    };
  });
  
  console.log(`🧠 Phase 2: Scored ${scoredDestinations.length} destinations using JS logic.`);
  
  // Sort by final score and return top results
  return scoredDestinations
    .sort((a, b) => b.final_score - a.final_score)
    .slice(0, 25);
};

/**
 * Calculates the Haversine distance between two points on Earth.
 * @returns {number} Distance in kilometers.
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Main service function to get recommendations.
 * Orchestrates the fetching and scoring process.
 * @param {object} params - User's travel preferences.
 * @returns {Promise<Array>} The final list of top recommendations.
 */
const getRecommendations = async (params) => {
  // Phase 1: Get potential candidates from DB
  const candidates = await fetchCandidateDestinations(params);

  if (!candidates || candidates.length === 0) {
    console.log("⚠️ No initial candidates found from database.");
    return [];
  }

  // Phase 2: Apply complex scoring and ranking in Node.js
  const finalRecommendations = scoreAndRankDestinations(candidates, params);
  
  console.log(`🏆 Phase 3: Finalized top ${finalRecommendations.length} recommendations.`);
  return finalRecommendations;
};

module.exports = {
  getRecommendations,
};
