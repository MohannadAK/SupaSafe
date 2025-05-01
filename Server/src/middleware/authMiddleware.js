const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
// KEY_ENCRYPTION_SECRET must be exactly 32 bytes (256 bits) for AES-256
const KEY_ENCRYPTION_SECRET = process.env.KEY_ENCRYPTION_SECRET || crypto.randomBytes(32).toString('base64');

/**
 * Middleware to verify JWT and establish authentication
 * Implements FR2 validation and NFR5 key protection
 */
exports.authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Extract user information
    req.user = {
      id: decoded.id,
      email: decoded.email
    };

    // Decrypt the KEK if needed for password operations
    if (decoded.encryptedKEK && decoded.kekIV) {
      try {
        // Ensure key is exactly 32 bytes (256 bits) for AES-256-CBC
        let secretKey;
        if (Buffer.from(KEY_ENCRYPTION_SECRET, 'base64').length !== 32) {
          // If not 32 bytes, derive a 32-byte key using SHA-256
          secretKey = crypto.createHash('sha256')
            .update(KEY_ENCRYPTION_SECRET)
            .digest();
        } else {
          secretKey = Buffer.from(KEY_ENCRYPTION_SECRET, 'base64');
        }

        const decipher = crypto.createDecipheriv(
          'aes-256-cbc',
          secretKey,
          Buffer.from(decoded.kekIV, 'base64')
        );

        let decrypted = decipher.update(Buffer.from(decoded.encryptedKEK, 'base64'), 'base64', 'binary');
        decrypted += decipher.final('binary');

        // Make KEK available for routes that need it
        req.kek = Buffer.from(decrypted, 'binary');
      } catch (decryptError) {
        console.error('KEK decryption error:', decryptError);
        // Continue even if KEK decryption fails - some routes may not need it
      }
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
  };
};