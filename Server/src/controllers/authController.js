const authService = require('../services/authService');

/**
 * Authentication controller
 */
exports.register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await authService.signup(email, password);

    return res.status(201).json({
      message: 'Registration successful',
      user: { id: result.user.id, email: result.user.email },
      token: result.token
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error.message === 'User already exists') {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({
      error: 'Server error during registration',
      details: error.message
    });
  }
};

/**
 * Login user and get token (FR2)
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await authService.login(email, password);

    return res.status(200).json({
      message: 'Login successful',
      user: { id: result.user.id, email: result.user.email },
      token: result.token
    });
  } catch (error) {
    console.error('Login error:', error);

    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.status(500).json({
      error: 'Server error during login',
      details: error.message
    });
  }
};

/**
 * Logout user (FR3)
 * Note: Client should discard token on logout
 */
exports.logout = async (req, res) => {
  // No server-side token invalidation is needed as per SRS
  // Client will clear the JWT from localStorage
  return res.status(200).json({ message: 'Logout successful' });
};

/**
 * Change master password (FR6)
 */
exports.changeMasterPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  try {
    const result = await authService.changeMasterPassword(userId, currentPassword, newPassword);

    return res.status(200).json({
      message: 'Password updated successfully',
      token: result.token
    });
  } catch (error) {
    console.error('Change password error:', error);

    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    if (error.message === 'Current password is incorrect') {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    return res.status(500).json({
      error: 'Server error during password change',
      details: error.message
    });
  }
};

/**
 * Get current user information
 */
exports.getUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await authService.getUser(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      error: 'Server error fetching user',
      details: error.message
    });
  }
};