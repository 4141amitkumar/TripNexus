const express = require('express');
const router = express.Router();
const recommendationService = require('../services/recommendationService');
const { AppError } = require('../utils/errors');

/**
 * @route   POST /api/trips/recommendations
 * @desc    Get trip recommendations based on user preferences
 * @access  Public
 */
router.post('/recommendations', async (req, res, next) => {
  try {
    const preferences = req.body;
    
    // Server-side validation
    if (!preferences.budget || !preferences.days) {
      // Using AppError to send a structured error to our global handler
      return next(new AppError('Budget and number of days are required fields.', 400));
    }
    
    const recommendations = await recommendationService.getRecommendations(preferences);
    res.status(200).json({
      status: 'success',
      results: recommendations.length,
      data: {
        trips: recommendations
      }
    });
  } catch (error) {
    next(error); // Pass database or other errors to the global error handler
  }
});

module.exports = router;

