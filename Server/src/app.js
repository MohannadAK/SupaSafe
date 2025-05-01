const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS support
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// API Routes
app.use('/api', routes);

// Error Handling
app.use(errorHandler);

module.exports = app; 