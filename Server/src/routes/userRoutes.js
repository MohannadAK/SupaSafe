const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { validateUser } = require('../middleware/validation');

// Get all users - Admin only
router.get('/', authenticate, userController.getAllUsers);

// Get user by ID
router.get('/:id', authenticate, userController.getUserById);

// Create new user
router.post('/', validateUser, userController.createUser);

// Update user
router.put('/:id', authenticate, validateUser, userController.updateUser);

// Delete user
router.delete('/:id', authenticate, userController.deleteUser);

module.exports = router; 