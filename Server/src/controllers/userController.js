const { User } = require('../models');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

// Get all users
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] }
  });
  
  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// Get user by ID
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password'] }
  });
  
  if (!user) {
    throw new AppError(`User not found with id ${req.params.id}`, 404);
  }
  
  res.status(200).json({
    success: true,
    data: user
  });
});

// Create new user
exports.createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  
  // Remove password from response
  const userData = user.toJSON();
  delete userData.password;
  
  res.status(201).json({
    success: true,
    data: userData
  });
});

// Update user
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  
  if (!user) {
    throw new AppError(`User not found with id ${req.params.id}`, 404);
  }
  
  await user.update(req.body);
  
  // Remove password from response
  const userData = user.toJSON();
  delete userData.password;
  
  res.status(200).json({
    success: true,
    data: userData
  });
});

// Delete user
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  
  if (!user) {
    throw new AppError(`User not found with id ${req.params.id}`, 404);
  }
  
  await user.destroy();
  
  res.status(204).json({
    success: true,
    data: null
  });
}); 