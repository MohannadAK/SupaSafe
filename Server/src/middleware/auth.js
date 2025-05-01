const { User } = require('../models');
const { verifyToken } = require('../utils/jwt');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Middleware to protect routes that require authentication
 */
exports.authenticate = asyncHandler(async (req, res, next) => {
  // Get token from header
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Not authorized to access this route', 401);
  }

  try {
    // Verify token
    const decoded = verifyToken(token);

    // Check if user still exists
    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw new AppError('The user belonging to this token no longer exists', 401);
    }

    // Add user to request
    req.user = user;
    next();
  } catch (err) {
    throw new AppError('Not authorized to access this route', 401);
  }
});

/**
 * Middleware to restrict access to specific roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError('You do not have permission to perform this action', 403);
    }
    next();
  };
}; 