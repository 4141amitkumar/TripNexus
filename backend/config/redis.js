// In backend/config/redis.js

const redis = require('redis');
require('dotenv').config();

// Create a Redis client
const redisClient = redis.createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

redisClient.on('connect', () => {
  console.log('🔗 Connected to Redis...');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

// Connect to Redis
(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;