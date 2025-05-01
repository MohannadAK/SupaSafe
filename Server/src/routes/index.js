const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API version
router.get('/', (req, res) => {
  res.status(200).json({ 
    name: 'API',
    version: '1.0.0',
    documentation: '/api/docs' 
  });
});

// Mount routes
router.use('/users', userRoutes);
router.use('/auth', authRoutes);

module.exports = router; 