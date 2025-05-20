const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

// Create Express app
const app = express();

// Configure CORS with specific options
const corsOptions = {
  // Allow requests from the frontend service
  origin: [
    `http://localhost:${process.env.CLIENT_PORT || 3001}`,
    // Allow from container name if using Docker network
    `http://app:${process.env.CLIENT_PORT || 3001}`,
    // During development, you might also need these
    `http://127.0.0.1:${process.env.CLIENT_PORT || 3001}`,
    // If frontend and backend are on the same origin in production
    `${process.env.FRONTEND_URL || ''}`,
        'http://supasafe.com'
  ].filter(Boolean), // Filter out empty values
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow cookies if you're using them
  maxAge: 86400, // Cache preflight request results for 24 hours (in seconds)
};

// Apply middleware
app.use(helmet({
  // Modify helmet to allow loading in iframes if needed
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
})); // Security headers
app.use(cors(corsOptions)); // Enable CORS with specific options
app.use(express.json()); // Parse JSON request bodies
app.use(morgan('dev')); // HTTP request logger

// Apply routes
app.use('/api', routes);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

module.exports = app;
