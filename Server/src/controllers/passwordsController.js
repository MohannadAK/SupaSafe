const passwordController = require('../controllers/passwordsController');
const { Password, User } = require('../models');
const cryptoService = require('../services/cryptoService');
const authService = require('../services/authService');

/**
 * Retrieve all sites 
 */
exports.getSites = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const sites = await Password.findAll({
      where: { userId },
      attributes: ['id', 'username', 'siteName', 'websiteUrl', 'creationDate', 'lastUpdate']
    });

    return res.status(200).json({
      message: 'Sites retrieved successfully',
      sites
    });
  } catch (error) {
    console.error('Get sites error:', error);

    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(500).json({
      error: 'Server error during site retrieval',
      details: error.message
    });
  }
};

/**
 * Add a new password 
 */
exports.addPassword = async (req, res) => {
  const { websiteUrl, username, password, siteName } = req.body;
  const userId = req.user.id;

  if (!websiteUrl || !username || !password || !siteName) {
    return res.status(400).json({ error: 'websiteUrl, username, password, and siteName are required' });
  }

  try {
    // Validate user existence using authService (already done in middleware, but keeping for consistency)
    const user = await authService.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!req.user.dek) {
      return res.status(500).json({ error: 'DEK not available for encryption' });
    }

    const { encryptedData: encryptedPassword, iv } = cryptoService.encryptPassword(password, req.user.dek);

    const now = new Date().toISOString();
    const newPassword = await Password.create({
      userId,
      websiteUrl,
      username,
      siteName,
      encryptedPass: encryptedPassword,
      iv,
      creationDate: now,
      lastUpdate: now
    });

    return res.status(201).json({
      message: 'Password added successfully',
      password: {
        id: newPassword.id,
        username: newPassword.username,
        siteName: newPassword.siteName,
        websiteUrl: newPassword.websiteUrl,
        creationDate: newPassword.creationDate,
        lastUpdate: newPassword.lastUpdate
      }
    });
  } catch (error) {
    console.error('Add password error:', error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Username already exists for this user' });
    }

    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(500).json({
      error: 'Server error during password addition',
      details: error.message
    });
  }
};

/**
 * Retrieve a password 
 */
exports.getPasswordById = async (req, res) => {
  const { passwordId } = req.params;
  const userId = req.user.id;

  if (!passwordId) {
    return res.status(400).json({ error: 'Password ID is required' });
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    if (!req.user.dek) {
      throw new Error('DEK not available for decryption');
    }

    const passwordData = await Password.findOne({
      where: { id: passwordId, userId }
    });

    if (!passwordData) throw new Error('Password not found');
    // (passwordData.userId !== userId) throw new Error('Unauthorized');

    const decryptedPassword = cryptoService.decryptPassword(passwordData.encryptedPass, passwordData.iv, req.user.dek);

    return res.status(200).json({
      message: 'Password retrieved successfully',
      password: {
        id: passwordData.id,
        username: passwordData.username,
        siteName: passwordData.siteName,
        websiteUrl: passwordData.websiteUrl,
        password: decryptedPassword,
        creationDate: passwordData.creationDate,
        lastUpdate: passwordData.lastUpdate
      }
    });
  } catch (error) {
    console.error('Get password error:', error);

    if (error.message === 'Password not found') {
      return res.status(404).json({ error: 'Password not found' });
    }

    if (error.message === 'Unauthorized') {
      return res.status(403).json({ error: 'You are not authorized to access this password' });
    }

    return res.status(500).json({
      error: 'Server error during password retrieval',
      details: error.message
    });
  }
};

/**
 * Delete a password 
 */
exports.deletePassword = async (req, res) => {
  const { passwordId } = req.params;
  const userId = req.user.id;

  if (!passwordId) {
    return res.status(400).json({ error: 'Password ID is required' });
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const password = await Password.findOne({
      where: { id: passwordId, userId }
    });

    if (!password) throw new Error('Password not found');
   // if (password.userId !== userId) throw new Error('Unauthorized');

    await password.destroy();

    return res.status(200).json({
      message: 'Password deleted successfully'
    });
  } catch (error) {
    console.error('Delete password error:', error);

    if (error.message === 'Password not found') {
      return res.status(404).json({ error: 'Password not found' });
    }

    if (error.message === 'Unauthorized') {
      return res.status(403).json({ error: 'You are not authorized to delete this password' });
    }

    return res.status(500).json({
      error: 'Server error during password deletion',
      details: error.message
    });
  }
};

/**
 * Update an existing password
 */
exports.updatePassword = async (req, res) => {
  const { passwordId } = req.params;
  const { websiteUrl, username, password, siteName } = req.body;
  const userId = req.user.id;

  if (!passwordId) {
    return res.status(400).json({ error: 'Password ID is required' });
  }

  if (!websiteUrl && !username && !password && !siteName) {
    return res.status(400).json({ error: 'At least one field (websiteUrl, username, password, or siteName) must be provided' });
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const passwordData = await Password.findOne({
      where: { id: passwordId, userId }
    });

    if (!passwordData) throw new Error('Password not found');
    //if (passwordData.userId !== userId) throw new Error('Unauthorized');

    const updateData = {};
    if (websiteUrl) updateData.websiteUrl = websiteUrl;
    if (username) updateData.username = username;
    if (siteName) updateData.siteName = siteName;
    if (password) {
      if (!req.user.dek) {
        throw new Error('DEK not available for encryption');
      }
      const { encryptedData: encryptedPassword, iv } = cryptoService.encryptPassword(password, req.user.dek);
      updateData.encryptedPass = encryptedPassword;
      updateData.iv = iv;
    }
    updateData.lastUpdate = new Date().toISOString();

    await passwordData.update(updateData);

    return res.status(200).json({
      message: 'Password updated successfully',
      password: {
        id: passwordData.id,
        username: passwordData.username,
        siteName: passwordData.siteName,
        websiteUrl: passwordData.websiteUrl,
        creationDate: passwordData.creationDate,
        lastUpdate: passwordData.lastUpdate
      }
    });
  } catch (error) {
    console.error('Update password error:', error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Username already exists for this user' });
    }

    if (error.message === 'Password not found') {
      return res.status(404).json({ error: 'Password not found' });
    }

    if (error.message === 'Unauthorized') {
      return res.status(403).json({ error: 'You are not authorized to update this password' });
    }

    return res.status(500).json({
      error: 'Server error during password update',
      details: error.message
    });
  }
};