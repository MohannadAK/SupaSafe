const express = require('express');
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route POST /api/auth/signup
 * @desc Register a new user
 * @access Public
 */
router.post('/signup', authController.register);

/**
 * @route POST /api/auth/login
 * @desc Login user and get token
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route POST /api/auth/logout
 * @desc Logout user (client should discard token)
 * @access Public
 */
router.post('/logout', authController.logout);

/**
 * @route PUT /api/auth/change-password
 * @desc Change user's master password
 * @access Private
 */
router.put('/change-password', authenticateJWT, authController.changeMasterPassword);

module.exports = router;