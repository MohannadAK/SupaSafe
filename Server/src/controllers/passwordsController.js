const passwordController = require('../controllers/passwordsController');
const cryptoService = require('../services/cryptoService');

/**
 * Add a new password 
 */
exports.addPassword = async (req, res) => {
  const { website, username, password } = req.body;
  const userId = req.user.id;

  if (!website || !username || !password) {
    return res.status(400).json({ error: 'Website, username, and password are required' });
  }

  try {
    const dek = await passwordService.getDEK(userId, req.user.encryptedKEK, req.user.kekIV);
    const { encryptedPassword, iv } = cryptoService.encryptPassword(password, dek);

    const result = await passwordService.addPassword(userId, website, username, encryptedPassword, iv);

    return res.status(201).json({
      message: 'Password added successfully',
      password: {
        id: result.id,
        website: result.website,
        username: result.username,
        creationDate: result.creationDate,
        lastUpdate: result.lastUpdate
      }
    });
  } catch (error) {
    console.error('Add password error:', error);

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
    const dek = await passwordService.getDEK(userId, req.user.encryptedKEK, req.user.kekIV);
    const passwordData = await passwordService.getPasswordById(userId, passwordId);
    const decryptedPassword = cryptoService.decryptPassword(passwordData.encrypted_password, passwordData.iv, dek);

    return res.status(200).json({
      message: 'Password retrieved successfully',
      password: {
        id: passwordData.id,
        website: passwordData.website,
        username: passwordData.username,
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
    await passwordService.deletePassword(userId, passwordId);

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
  const { website, username, password } = req.body;
  const userId = req.user.id;

  if (!passwordId) {
    return res.status(400).json({ error: 'Password ID is required' });
  }

  if (!website && !username && !password) {
    return res.status(400).json({ error: 'At least one field (website, username, or password) must be provided' });
  }

  try {
    const dek = await passwordService.getDEK(userId, req.user.encryptedKEK, req.user.kekIV); 
    const updateData = {};
    if (website) updateData.website = website;
    if (username) updateData.username = username;
    if (password) {
      const { encryptedPassword, iv } = cryptoService.encryptPassword(password, dek);
      updateData.encrypted_password = encryptedPassword;
      updateData.iv = iv;
    }

    const result = await passwordService.updatePassword(userId, passwordId, updateData);

    return res.status(200).json({
      message: 'Password updated successfully',
      password: {
        id: result.id,
        website: result.website,
        username: result.username,
        creationDate: result.creationDate,
        lastUpdate: result.lastUpdate
      }
    });
  } catch (error) {
    console.error('Update password error:', error);

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