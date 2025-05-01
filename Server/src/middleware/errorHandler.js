const logger = require('../utils/logger');

/**
 * Global error handler middleware
 */
exports.errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Log error details
  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  logger.error(err.stack);
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: statusCode === 500 && process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}; 