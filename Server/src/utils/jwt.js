const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @returns {string} JWT token
 */
exports.generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

/**
 * Generate refresh token
 * @param {string} userId - User ID
 * @returns {string} JWT refresh token
 */
exports.generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} Decoded token
 */
exports.verifyToken = (token, secret = process.env.JWT_SECRET || 'your-secret-key') => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
}; 