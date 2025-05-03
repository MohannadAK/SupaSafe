const express = require('express');
const authRoutes = require('./authRoutes');
const passwordRoutes = require('./passwordRoutes');

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date()
  });
});

// Auth routes
router.use('/auth', authRoutes);

// password routes
router.use('/passwords', passwordRoutes);

// 404 handler for API routes
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

module.exports = router;