/**
 * File: middleware/authMiddleware.js
 * Description: Authentication middleware with token invalidation
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const cryptoService = require('../services/cryptoService');
const authService = require('../services/authService');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

/**
 * Middleware to verify JWT and establish authentication
 * Implements FR2 validation and NFR5 key protection
 */
exports.authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find the user to check token version
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // If token version doesn't match or is missing, token is invalid
    if (decoded.tokenVersion === undefined || decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({
        error: 'Invalid token',
        code: 'TOKEN_VERSION_MISMATCH',
        message: 'Your credentials have changed. Please log in again.'
      });
    }

    // Extract user information
    req.user = {
      id: decoded.id,
      email: decoded.email,
      tokenVersion: decoded.tokenVersion 
    };

    // Decrypt the KEK if needed for password operations
    if (decoded.encryptedKEK && decoded.kekIV) {
      try {
        // Decrypt KEK for operations that require it
        const kek = cryptoService.decryptKEKFromJWT(decoded.encryptedKEK, decoded.kekIV);
        
        req.user.dek = await authService.getDEK(decoded.id, kek);
      } catch (decryptError) {
        console.error('KEK/DEK decryption error:', decryptError);
        return res.status(500).json({
          error: 'Failed to decrypt encryption keys',
          details: decryptError.message
        });
      }
    } else {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token missing required encryption key data'
      });
    }

    next();
  } catch (error) {
    console.error('JWT authentication error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Rate limiter for authentication endpoints
 * Helps prevent brute force attacks
 */
exports.rateLimiter = (maxRequests = 5, windowMs = 60000) => {
  const requestCounts = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    // Clean up old entries
    for (const [key, value] of requestCounts.entries()) {
      if (now - value.timestamp > windowMs) {
        requestCounts.delete(key);
      }
    }

    // Check if IP is in map
    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, {
        count: 1,
        timestamp: now
      });
      return next();
    }

    // Increment count
    const record = requestCounts.get(ip);

    // Check if window has expired
    if (now - record.timestamp > windowMs) {
      // Reset for new window
      record.count = 1;
      record.timestamp = now;
      return next();
    }

    // Check against limit
    if (record.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests, please try again later',
        retryAfter: Math.ceil((record.timestamp + windowMs - now) / 1000)
      });
    }

    // Increment count and allow request
    record.count += 1;
    return next();
  }
};