const { User } = require('../models');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken, verifyToken } = require('../utils/jwt');
const bcrypt = require('bcrypt');

// Register new user
exports.register = asyncHandler(async (req, res) => {
  // Check if user already exists
  const userExists = await User.findOne({ where: { email: req.body.email } });
  
  if (userExists) {
    throw new AppError('User already exists with that email', 400);
  }
  
  // Create user
  const user = await User.create(req.body);
  
  // Generate token
  const token = generateToken(user.id);
  
  // Remove password from response
  const userData = user.toJSON();
  delete userData.password;
  
  res.status(201).json({
    success: true,
    token,
    data: userData
  });
});

// Login user
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Check if user exists
  const user = await User.findOne({ where: { email } });
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid credentials', 401);
  }
  
  // Generate token
  const token = generateToken(user.id);
  
  // Remove password from response
  const userData = user.toJSON();
  delete userData.password;
  
  res.status(200).json({
    success: true,
    token,
    data: userData
  });
});

// Refresh token
exports.refreshToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    throw new AppError('Please provide a token', 400);
  }
  
  // Verify token
  const decoded = verifyToken(token, process.env.JWT_REFRESH_SECRET);
  
  // Check if user exists
  const user = await User.findByPk(decoded.id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Generate new token
  const newToken = generateToken(user.id);
  
  res.status(200).json({
    success: true,
    token: newToken
  });
});

// Logout
exports.logout = asyncHandler(async (req, res) => {
  // In a real implementation, you might invalidate the token in a database
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
}); 