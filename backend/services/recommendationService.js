// services/recommendationService.js
/**
 * Enterprise-Grade Trip Recommendation System
 * * Features:
 * - Multi-dimensional scoring algorithm
 * - Age, gender, and travel style personalization
 * - Multi-city recommendations for extended trips
 * - Real-time weather and seasonal considerations
 * - Budget optimization with cost breakdown
 * - Performance optimized with proper indexing strategy
 * * @author Travel Recommendation Engine
 * @version 2.0
 */

const pool = require('../db');
const logger = require('../utils/logger');
const { ValidationError, DatabaseError } = require('../utils/errors');
// const redisClient = require('../config/redis'); // UPDATED: Commented out Redis client
require('dotenv').config();

class TripRecommendationService {
  constructor() {
    this.CACHE_TTL = 3600; // 1 hour cache
    this.MAX_CANDIDATES = 250;
    this.MAX_RECOMMENDATIONS = 30;
    this.NEARBY_RADIUS_KM = 100;
  }

  /**
   * Main recommendation engine entry point
   * @param {Object} params - User preferences and constraints
   * @returns {Promise<Array>} Personalized trip recommendations
   */
  async getRecommendations(params) {
    const startTime = Date.now();
    
    try {
      // Input validation and sanitization
      const validatedParams = this.validateAndSanitizeParams(params);
      
      logger.info('Starting recommendation generation', { 
        userId: validatedParams.user_id,
        params: validatedParams 
      });

      // UPDATED: Commented out the cache check logic
      // // Check cache first
      // const cacheKey = this.generateCacheKey(validatedParams);
      // const cachedResults = await this.getCachedRecommendations(cacheKey);
      
      // if (cachedResults) {
      //   logger.info('Returning cached recommendations', { cacheKey });
      //   return cachedResults;
      // }

      // Phase 1: Smart candidate pre-filtering
      const candidates = await this.fetchSmartCandidates(validatedParams);
      
      if (!candidates?.length) {
        logger.warn('No candidates found for user preferences', validatedParams);
        return [];
      }

      // Phase 2: Multi-dimensional scoring and ranking
      const scoredRecommendations = await this.applyIntelligentScoring(candidates, validatedParams);
      
      // Phase 3: Post-processing for multi-city and nearby attractions
      const finalRecommendations = await this.enhanceRecommendations(
        scoredRecommendations, 
        validatedParams
      );

      // UPDATED: Commented out the cache saving logic
      // // Cache results
      // await this.cacheRecommendations(cacheKey, finalRecommendations);
      
      const executionTime = Date.now() - startTime;
      logger.info('Recommendation generation completed', { 
        executionTime, 
        resultCount: finalRecommendations.length 
      });

      return finalRecommendations;

    } catch (error) {
      logger.error('Error in recommendation generation', error);
      throw new DatabaseError('Failed to generate recommendations', error);
    }
  }

  /**
   * Smart candidate fetching with optimized queries
   * Uses database indexes effectively and filters early
   */
  async fetchSmartCandidates(params) {
    const {
      departure_lat,
      departure_lng,
      budget,
      travel_month,
      preferred_category,
      duration_days,
      age,
      gender,
      tourist_type,
      user_id
    } = params;

    // Build dynamic query based on user preferences
    const query = `
      SELECT 
        d.destination_id,
        d.name AS destination_name,
        d.description,
        d.country,
        d.state,
        d.city,
        d.latitude,
        d.longitude,
        d.image_url,
        d.overall_rating,
        d.total_reviews,
        d.average_visit_duration_hours,
        d.entry_fee,
        d.altitude_meters,
        d.is_accessible_elderly,
        d.is_accessible_disabled,
        d.crowd_level,
        d.safety_score,
        d.popularity_score,
        d.best_visit_duration_days,
        d.nearby_airport_distance_km,
        d.avg_daily_food_cost,
        d.avg_daily_transport_cost,
        
        -- Category information
        dc.category_name,
        dc.physical_demand_level,
        dc.romance_score,
        dc.family_friendliness,
        dc.adventure_level,
        dc.cultural_richness,
        
        -- Weather and seasonal data
        sw.avg_temperature,
        sw.avg_rainfall_mm,
        sw.humidity_percent,
        sw.weather_score,
        sw.is_peak_season,
        sw.crowd_multiplier,
        sw.festival_season,
        sw.special_notes,
        
        -- Nearby attractions count (optimized subquery)
        COALESCE(na.nearby_count, 0) as nearby_attractions_count,
        
        -- Transportation connectivity
        COALESCE(tc.connectivity_score, 5.0) as transport_connectivity_score,
        
        -- Hotel availability and pricing
        COALESCE(ha.min_price, 2000) as min_hotel_price,
        COALESCE(ha.max_price, 8000) as max_hotel_price,
        COALESCE(ha.avg_rating, 3.5) as avg_hotel_rating,
        COALESCE(ha.hotel_count, 0) as available_hotels_count

      FROM destinations d
      
      INNER JOIN destination_categories dc ON d.category_id = dc.category_id
      
      LEFT JOIN seasonal_weather sw ON d.destination_id = sw.destination_id 
        AND sw.month = ?
      
      -- Precomputed nearby attractions count for performance
      LEFT JOIN (
        SELECT 
          dp.destination_a as dest_id,
          COUNT(*) as nearby_count
        FROM destination_proximity dp
        WHERE dp.distance_km <= ?
        GROUP BY dp.destination_a
      ) na ON d.destination_id = na.dest_id
      
      -- Transportation connectivity score
      LEFT JOIN (
        SELECT 
          to1.to_destination as dest_id,
          AVG(CASE 
            WHEN to1.frequency_per_day >= 4 THEN 10
            WHEN to1.frequency_per_day >= 2 THEN 7
            ELSE 4
          END) as connectivity_score
        FROM transport_options to1
        GROUP BY to1.to_destination
      ) tc ON d.destination_id = tc.dest_id
      
      -- Hotel availability and pricing
      LEFT JOIN (
        SELECT 
          h.destination_id,
          MIN(h.price_per_night_min) as min_price,
          MAX(h.price_per_night_max) as max_price,
          AVG(h.avg_rating) as avg_rating,
          COUNT(*) as hotel_count
        FROM hotels h
        WHERE h.is_active = 1
        GROUP BY h.destination_id
      ) ha ON d.destination_id = ha.destination_id

      WHERE d.is_active = 1
        AND d.overall_rating >= 3.0
        AND d.safety_score >= 6.0
        AND (? IS NULL OR dc.category_name = ?)
        AND (d.is_accessible_elderly = 1 OR ? < 60)
        AND COALESCE(ha.min_price, 2000) * ? <= ? * 1.2

      ORDER BY 
        d.popularity_score DESC,
        d.overall_rating DESC,
        d.total_reviews DESC

      LIMIT ?
    `;

    const queryParams = [
      travel_month,                    // sw.month
      this.NEARBY_RADIUS_KM,          // nearby attractions radius
      preferred_category,              // category filter 1
      preferred_category,              // category filter 2
      age,                            // elderly accessibility check
      duration_days,                  // hotel cost calculation
      budget,                         // budget constraint
      this.MAX_CANDIDATES             // result limit
    ];

    const [candidates] = await pool.execute(query, queryParams);
    
    logger.info(`Phase 1: Fetched ${candidates.length} smart candidates`, {
      filters: { preferred_category, budget, duration_days }
    });

    return candidates;
  }

  /**
   * Advanced multi-dimensional scoring algorithm
   * Considers user demographics, preferences, and constraints
   */
  async applyIntelligentScoring(candidates, params) {
    const {
      departure_lat,
      departure_lng,
      age,
      gender,
      budget,
      tourist_type,
      duration_days,
      travel_month,
      user_id
    } = params;

    // Get user's historical preferences if available
    const userHistory = await this.getUserTravelHistory(user_id);
    const userPreferences = await this.getUserPreferences(user_id);

    const scoredDestinations = candidates.map(destination => {
      // Initialize scoring components (Total: 100 points)
      const scores = {
        baseQuality: this.calculateBaseQualityScore(destination),           // 20 points
        weatherSeasonal: this.calculateWeatherScore(destination),           // 18 points
        distanceCost: this.calculateDistanceScore(destination, departure_lat, departure_lng), // 15 points
        personalization: this.calculatePersonalizationScore(destination, params, userHistory), // 20 points
        budgetOptimization: this.calculateBudgetScore(destination, params), // 12 points
        durationMatch: this.calculateDurationScore(destination, duration_days), // 10 points
        accessibilityBonus: this.calculateAccessibilityScore(destination, age), // 5 points
      };

      const finalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
      
      return {
        ...destination,
        distance_km: this.calculateDistance(departure_lat, departure_lng, destination.latitude, destination.longitude),
        estimated_total_cost: this.calculateTotalTripCost(destination, params),
        final_score: Math.round(finalScore * 100) / 100,
        score_breakdown: scores,
        personalization_factors: this.getPersonalizationFactors(destination, params)
      };
    });

    const rankedDestinations = scoredDestinations
      .sort((a, b) => b.final_score - a.final_score)
      .slice(0, this.MAX_RECOMMENDATIONS);

    logger.info(`Phase 2: Scored and ranked ${rankedDestinations.length} destinations`);
    return rankedDestinations;
  }

  /**
   * Enhanced recommendations with multi-city options and detailed information
   */
  async enhanceRecommendations(recommendations, params) {
    const { duration_days, user_id } = params;
    const shouldIncludeMultiCity = duration_days >= 5;

    const enhancedRecommendations = await Promise.all(
      recommendations.map(async (destination, index) => {
        const enhancements = {
          ranking_position: index + 1,
          confidence_score: this.calculateConfidenceScore(destination.final_score),
          suggested_duration: this.getSuggestedDuration(destination, duration_days),
          best_activities: await this.getTopActivities(destination.destination_id, params),
          accommodation_options: await this.getAccommodationSummary(destination.destination_id, params),
          transport_options: await this.getTransportOptions(destination, params),
          weather_forecast: this.getWeatherInsights(destination, params.travel_month),
        };

        // Add multi-city options for longer trips
        if (shouldIncludeMultiCity && index < 10) {
          const nearbyDestinations = await this.findNearbyDestinations(
            destination.destination_id, 
            destination.latitude, 
            destination.longitude
          );
          
          enhancements.multi_city_options = {
            nearby_destinations: nearbyDestinations,
            is_multi_city_recommended: nearbyDestinations.length >= 2,
            extended_itinerary_possible: duration_days >= 7 && nearbyDestinations.length >= 1
          };
        }

        return {
          ...destination,
          ...enhancements
        };
      })
    );

    logger.info(`Phase 3: Enhanced ${enhancedRecommendations.length} recommendations with additional data`);
    return enhancedRecommendations;
  }

  // ============= SCORING METHODS =============

  calculateBaseQualityScore(destination) {
    const ratingScore = (destination.overall_rating / 5.0) * 12;
    const reviewScore = Math.min(4, Math.log10(destination.total_reviews + 1));
    const popularityScore = (destination.popularity_score / 10.0) * 4;
    
    return ratingScore + reviewScore + popularityScore;
  }

  calculateWeatherScore(destination) {
    let score = 0;
    
    // Base weather score
    if (destination.weather_score) {
      score += (destination.weather_score / 10.0) * 10;
    } else {
      score += 7; // Default moderate score
    }
    
    // Seasonal bonuses
    if (destination.is_peak_season) score += 4;
    if (destination.festival_season) score += 2;
    
    // Temperature comfort
    const temp = destination.avg_temperature;
    if (temp >= 18 && temp <= 32) score += 2;
    
    return Math.min(18, score);
  }

  calculateDistanceScore(destination, userLat, userLng) {
    const distance = this.calculateDistance(userLat, userLng, destination.latitude, destination.longitude);
    
    // Distance scoring with diminishing returns
    if (distance <= 200) return 15;
    if (distance <= 500) return 12;
    if (distance <= 1000) return 9;
    if (distance <= 2000) return 6;
    if (distance <= 3000) return 3;
    return 1;
  }

  calculatePersonalizationScore(destination, params, userHistory = null) {
    const { age, gender, tourist_type } = params;
    let score = 0;

    // Tourist type preferences
    switch (tourist_type) {
      case 'Solo':
        score += destination.adventure_level * 1.5;
        score += destination.cultural_richness * 1.2;
        score += destination.safety_score * 0.8;
        break;
      case 'Couple':
        score += destination.romance_score * 2.0;
        score += (destination.overall_rating / 5.0) * 3;
        score += (10 - destination.crowd_level) * 0.5;
        break;
      case 'Family':
        score += destination.family_friendliness * 1.8;
        score += destination.safety_score * 1.2;
        score += destination.is_accessible_elderly ? 2 : 0;
        score += (10 - destination.physical_demand_level) * 0.8;
        break;
      case 'Friends':
        score += destination.adventure_level * 1.2;
        score += destination.popularity_score * 0.8;
        score += destination.crowd_level * 0.6; // Friends groups don't mind crowds
        score += 3; // Base bonus for group activities
        break;
      default:
        score = 12;
    }

    // Age-based adjustments
    if (age >= 18 && age <= 25) {
      score += destination.adventure_level * 0.5;
      score += destination.popularity_score * 0.4;
    } else if (age >= 26 && age <= 35) {
      score += destination.cultural_richness * 0.6;
      score += (destination.overall_rating / 5.0) * 2;
    } else if (age >= 36 && age <= 50) {
      score += destination.cultural_richness * 0.8;
      score += destination.safety_score * 0.5;
      score += (10 - destination.physical_demand_level) * 0.4;
    } else if (age > 50) {
      score += destination.cultural_richness * 1.0;
      score += destination.safety_score * 0.8;
      score += (10 - destination.physical_demand_level) * 0.8;
      score += destination.is_accessible_elderly ? 3 : -2;
    }

    // Gender-based safety considerations
    if (gender === 'female') {
      score += destination.safety_score * 0.4;
    }

    // Historical preferences boost
    if (userHistory && userHistory.length > 0) {
      const avgHistoricalRating = userHistory.reduce((sum, trip) => sum + trip.user_rating, 0) / userHistory.length;
      if (destination.overall_rating >= avgHistoricalRating) {
        score += 2;
      }
    }

    return Math.min(20, Math.max(0, score));
  }

  calculateBudgetScore(destination, params) {
    const { budget, duration_days } = params;
    const totalCost = this.calculateTotalTripCost(destination, params);
    const budgetUtilization = totalCost / budget;

    if (budgetUtilization <= 0.6) return 12;      // Under budget - excellent
    if (budgetUtilization <= 0.8) return 10;      // Good value
    if (budgetUtilization <= 1.0) return 8;       // Within budget
    if (budgetUtilization <= 1.15) return 5;      // Slightly over budget
    if (budgetUtilization <= 1.3) return 2;       // Significantly over budget
    return 0;                                      // Way over budget
  }

  calculateDurationScore(destination, durationDays) {
    const recommendedDays = destination.best_visit_duration_days || 3;
    const nearbyCount = destination.nearby_attractions_count || 0;

    let score = 0;

    // Base duration matching
    if (Math.abs(durationDays - recommendedDays) <= 1) {
      score += 6;
    } else if (Math.abs(durationDays - recommendedDays) <= 2) {
      score += 4;
    } else {
      score += 2;
    }

    // Extended stay potential for longer trips
    if (durationDays >= 5) {
      score += Math.min(4, nearbyCount);
    }

    return Math.min(10, score);
  }

  calculateAccessibilityScore(destination, age) {
    let score = 0;

    if (age >= 60 && destination.is_accessible_elderly) {
      score += 3;
    } else if (age >= 60 && !destination.is_accessible_elderly) {
      score -= 2;
    }

    if (destination.physical_demand_level <= 3) {
      score += 2;
    }

    return Math.max(0, Math.min(5, score));
  }

  // ============= UTILITY METHODS =============

  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  calculateTotalTripCost(destination, params) {
    const { duration_days, departure_lat, departure_lng } = params;
    const distance = this.calculateDistance(departure_lat, departure_lng, destination.latitude, destination.longitude);
    
    // Transport cost calculation
    let transportCost = 0;
    if (distance <= 300) {
      transportCost = distance * 8; // Local transport rate
    } else if (distance <= 1000) {
      transportCost = distance * 12; // Train/bus rate
    } else {
      transportCost = Math.min(distance * 15, 25000); // Flight rate with cap
    }

    // Accommodation cost
    const avgHotelCost = destination.min_hotel_price || 2000;
    const accommodationCost = avgHotelCost * duration_days;

    // Food cost
    const foodCost = (destination.avg_daily_food_cost || 1000) * duration_days;

    // Transport within city
    const localTransportCost = (destination.avg_daily_transport_cost || 500) * duration_days;

    // Activities and miscellaneous
    const activitiesCost = duration_days * 1200;

    return Math.round(transportCost + accommodationCost + foodCost + localTransportCost + activitiesCost);
  }

  calculateConfidenceScore(finalScore) {
    if (finalScore >= 80) return 'High';
    if (finalScore >= 65) return 'Medium-High';
    if (finalScore >= 50) return 'Medium';
    if (finalScore >= 35) return 'Medium-Low';
    return 'Low';
  }

  getSuggestedDuration(destination, requestedDays) {
    const baseDays = destination.best_visit_duration_days || 3;
    const nearbyCount = destination.nearby_attractions_count || 0;
    
    let minDays = baseDays;
    let maxDays = baseDays + Math.floor(nearbyCount / 2);
    let optimalDays = Math.min(Math.max(requestedDays, minDays), maxDays);

    return {
      minimum_recommended: minDays,
      maximum_recommended: maxDays,
      optimal_for_request: optimalDays,
      can_extend: nearbyCount >= 3,
      extension_reason: nearbyCount >= 3 ? `${nearbyCount} nearby attractions available` : null
    };
  }

  getPersonalizationFactors(destination, params) {
    const factors = [];
    const { tourist_type, age, duration_days } = params;

    if (destination.romance_score >= 8 && tourist_type === 'Couple') {
      factors.push('Perfect for couples');
    }
    if (destination.family_friendliness >= 8 && tourist_type === 'Family') {
      factors.push('Excellent for families');
    }
    if (destination.adventure_level >= 8 && age <= 35) {
      factors.push('Great for adventure seekers');
    }
    if (destination.cultural_richness >= 8) {
      factors.push('Rich cultural experience');
    }
    if (destination.nearby_attractions_count >= 5 && duration_days >= 5) {
      factors.push('Perfect for extended exploration');
    }
    if (destination.safety_score >= 9) {
      factors.push('Excellent safety rating');
    }

    return factors;
  }

  // ============= DATA FETCHING METHODS =============

  async getTopActivities(destinationId, params, limit = 5) {
    const { age, tourist_type, budget } = params;
    
    const query = `
      SELECT 
        name, 
        description, 
        category, 
        duration_hours, 
        price_min, 
        price_max,
        difficulty_level,
        popularity_score,
        safety_rating
      FROM activities 
      WHERE destination_id = ? 
        AND is_active = 1
        AND age_restriction_min <= ?
        AND (age_restriction_max >= ? OR age_restriction_max IS NULL)
        AND price_max <= ?
      ORDER BY popularity_score DESC, safety_rating DESC
      LIMIT ?
    `;

    const maxActivityBudget = Math.round(budget * 0.2); // 20% of budget for activities
    const [activities] = await pool.execute(query, [destinationId, age, age, maxActivityBudget, limit]);
    return activities;
  }

  async getAccommodationSummary(destinationId, params) {
    const { budget, duration_days, tourist_type } = params;
    
    const dailyBudget = Math.round(budget / duration_days * 0.4); // 40% of daily budget for accommodation
    
    const query = `
      SELECT 
        COUNT(*) as total_hotels,
        MIN(price_per_night_min) as cheapest_option,
        MAX(price_per_night_max) as most_expensive,
        AVG(avg_rating) as avg_hotel_rating,
        COUNT(CASE WHEN is_couple_friendly = 1 THEN 1 END) as couple_friendly_count,
        COUNT(CASE WHEN is_family_friendly = 1 THEN 1 END) as family_friendly_count,
        COUNT(CASE WHEN price_per_night_min <= ? THEN 1 END) as budget_friendly_count
      FROM hotels 
      WHERE destination_id = ? AND is_active = 1
    `;

    const [summary] = await pool.execute(query, [dailyBudget, destinationId]);
    return summary[0] || {};
  }

  async getTransportOptions(destination, params) {
    const { departure_lat, departure_lng } = params;
    
    // This would typically involve more complex logic to find transport routes
    // For now, return basic connectivity information
    const connectivity = destination.transport_connectivity_score || 5;
    const airportDistance = destination.nearby_airport_distance_km;
    
    return {
      connectivity_score: connectivity,
      nearest_airport_km: airportDistance,
      estimated_flight_available: airportDistance <= 100,
      estimated_train_available: connectivity >= 6,
      estimated_bus_available: connectivity >= 4
    };
  }

  getWeatherInsights(destination, travelMonth) {
    return {
      temperature: destination.avg_temperature,
      rainfall: destination.avg_rainfall_mm,
      humidity: destination.humidity_percent,
      weather_rating: destination.weather_score,
      is_peak_season: destination.is_peak_season,
      has_festivals: destination.festival_season,
      special_notes: destination.special_notes,
      weather_recommendation: this.getWeatherRecommendation(destination)
    };
  }

  getWeatherRecommendation(destination) {
    if (destination.weather_score >= 9) return 'Excellent weather expected';
    if (destination.weather_score >= 7) return 'Good weather conditions';
    if (destination.weather_score >= 5) return 'Moderate weather, pack accordingly';
    return 'Check weather forecast before travel';
  }

  async findNearbyDestinations(destinationId, lat, lng, limit = 3) {
    const query = `
      SELECT 
        d.destination_id,
        d.name,
        d.city,
        d.overall_rating,
        d.image_url,
        d.best_visit_duration_days,
        dp.distance_km,
        dp.travel_time_hours,
        dp.transportation_type,
        dp.cost_estimate
      FROM destination_proximity dp
      JOIN destinations d ON dp.destination_b = d.destination_id
      WHERE dp.destination_a = ?
        AND dp.distance_km <= ?
        AND d.is_active = 1
        AND d.overall_rating >= 3.5
      ORDER BY dp.distance_km ASC, d.overall_rating DESC
      LIMIT ?
    `;

    const [nearby] = await pool.execute(query, [destinationId, this.NEARBY_RADIUS_KM, limit]);
    return nearby;
  }

  async getUserTravelHistory(userId, limit = 5) {
    if (!userId) return [];
    
    const query = `
      SELECT 
        destination_id,
        tourist_type_id,
        duration_days,
        total_spent,
        user_rating,
        travel_date
      FROM user_trips 
      WHERE user_id = ? 
      ORDER BY travel_date DESC 
      LIMIT ?
    `;

    const [history] = await pool.execute(query, [userId, limit]);
    return history;
  }

  async getUserPreferences(userId) {
    if (!userId) return null;
    
    const query = `
      SELECT 
        category_id,
        preference_weight,
        avoid_crowds,
        preferred_travel_style,
        safety_priority
      FROM user_preferences 
      WHERE user_id = ?
    `;

    const [preferences] = await pool.execute(query, [userId]);
    return preferences[0] || null;
  }

  // ============= VALIDATION AND CACHING =============

  validateAndSanitizeParams(params) {
    const {
      user_id = null,
      departure_lat = 28.6139,  // Default to Delhi
      departure_lng = 77.2090,
      age = 25,
      gender = 'prefer_not_to_say',
      budget = 50000,
      duration_days = 3,
      travel_month = new Date().getMonth() + 1,
      tourist_type = 'Solo',
      preferred_category = null
    } = params;

    // Validation
    if (age < 5 || age > 100) {
      throw new ValidationError('Age must be between 5 and 100');
    }
    if (budget < 5000 || budget > 10000000) {
      throw new ValidationError('Budget must be between ₹5,000 and ₹1,00,00,000');
    }
    if (duration_days < 1 || duration_days > 30) {
      throw new ValidationError('Trip duration must be between 1 and 30 days');
    }
    if (travel_month < 1 || travel_month > 12) {
      throw new ValidationError('Travel month must be between 1 and 12');
    }

    return {
      user_id,
      departure_lat: parseFloat(departure_lat),
      departure_lng: parseFloat(departure_lng),
      age: parseInt(age),
      gender,
      budget: parseInt(budget),
      duration_days: parseInt(duration_days),
      travel_month: parseInt(travel_month),
      tourist_type,
      preferred_category
    };
  }

  generateCacheKey(params) {
    const keyData = {
      lat: Math.round(params.departure_lat * 100),
      lng: Math.round(params.departure_lng * 100),
      age: params.age,
      budget: Math.round(params.budget / 1000) * 1000, // Round to nearest 1000
      duration: params.duration_days,
      month: params.travel_month,
      type: params.tourist_type,
      category: params.preferred_category || 'all'
    };
    
    return `recommendations:${Object.values(keyData).join(':')}`;
  }

  async getCachedRecommendations(cacheKey) {
    // UPDATED: All Redis logic is commented out to prevent connection errors.
    // try {
    //   if (!redisClient) return null;
    //   const cached = await redisClient.get(cacheKey);
    //   return cached ? JSON.parse(cached) : null;
    // } catch (error) {
    //   logger.warn('Cache retrieval failed', { cacheKey, error: error.message });
    //   return null;
    // }
    return null; // Always return null as if cache was missed
  }

  async cacheRecommendations(cacheKey, recommendations) {
    // UPDATED: All Redis logic is commented out to prevent connection errors.
    // try {
    //   if (!redisClient) return;
    //   await redisClient.setex(cacheKey, this.CACHE_TTL, JSON.stringify(recommendations));
    // } catch (error) {
    //   logger.warn('Cache storage failed', { cacheKey, error: error.message });
    // }
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
}

// ============= ADDITIONAL UTILITY SERVICES =============

/**
 * Service for handling destination details and itinerary generation
 */
class DestinationDetailService {
  constructor() {
    this.recommendationService = new TripRecommendationService();
  }

  /**
   * Get comprehensive destination details with itinerary suggestions
   */
  async getDestinationDetails(destinationId, params) {
    try {
      const query = `
        SELECT 
          d.*,
          dc.category_name,
          dc.physical_demand_level,
          dc.romance_score,
          dc.family_friendliness,
          dc.adventure_level,
          dc.cultural_richness,
          sw.avg_temperature,
          sw.avg_rainfall_mm,
          sw.weather_score,
          sw.is_peak_season,
          sw.festival_season,
          sw.special_notes
        FROM destinations d
        LEFT JOIN destination_categories dc ON d.category_id = dc.category_id
        LEFT JOIN seasonal_weather sw ON d.destination_id = sw.destination_id 
          AND sw.month = ?
        WHERE d.destination_id = ? AND d.is_active = 1
      `;

      const [destinations] = await pool.execute(query, [params.travel_month || new Date().getMonth() + 1, destinationId]);
      
      if (!destinations.length) {
        throw new ValidationError('Destination not found');
      }

      const destination = destinations[0];

      // Get comprehensive details
      const [activities, hotels, reviews, emergencyServices, tags] = await Promise.all([
        this.getDestinationActivities(destinationId, params),
        this.getDestinationHotels(destinationId, params),
        this.getDestinationReviews(destinationId, 5),
        this.getEmergencyServices(destinationId),
        this.getDestinationTags(destinationId)
      ]);

      // Generate suggested itinerary
      const itinerary = await this.generateItinerary(destination, activities, params);
      
      // Get nearby destinations for multi-city options
      const nearbyDestinations = await this.recommendationService.findNearbyDestinations(
        destinationId, 
        destination.latitude, 
        destination.longitude,
        5
      );

      return {
        destination_info: destination,
        activities: activities,
        accommodation_options: hotels,
        recent_reviews: reviews,
        emergency_contacts: emergencyServices,
        destination_tags: tags,
        suggested_itinerary: itinerary,
        nearby_destinations: nearbyDestinations,
        travel_insights: this.getTravelInsights(destination, params),
        cost_breakdown: this.getDetailedCostBreakdown(destination, params)
      };

    } catch (error) {
      logger.error('Error fetching destination details', { destinationId, error });
      throw error;
    }
  }

  async getDestinationActivities(destinationId, params) {
    const { age, budget, duration_days, tourist_type } = params;
    
    const query = `
      SELECT 
        activity_id,
        name,
        description,
        category,
        duration_hours,
        price_min,
        price_max,
        difficulty_level,
        age_restriction_min,
        age_restriction_max,
        group_size_min,
        group_size_max,
        best_time,
        equipment_provided,
        advance_booking_required,
        seasonal_availability,
        safety_rating,
        popularity_score,
        is_guided,
        includes_transport,
        includes_meals
      FROM activities 
      WHERE destination_id = ? 
        AND is_active = 1
        AND (age_restriction_min IS NULL OR age_restriction_min <= ?)
        AND (age_restriction_max IS NULL OR age_restriction_max >= ?)
        AND price_max <= ?
      ORDER BY popularity_score DESC, safety_rating DESC
      LIMIT 20
    `;

    const activityBudget = Math.round(budget * 0.25); // 25% of budget for activities
    const [activities] = await pool.execute(query, [destinationId, age, age, activityBudget]);
    
    return activities.map(activity => ({
      ...activity,
      recommended_for_group: this.isActivityRecommendedForGroup(activity, tourist_type),
      difficulty_description: this.getDifficultyDescription(activity.difficulty_level)
    }));
  }
  
  // Note: The original file was cut off here. The remaining methods of DestinationDetailService are not present.
  // The primary goal of fixing the Redis issue in TripRecommendationService is complete.
}

// Export the primary service
module.exports = new TripRecommendationService();