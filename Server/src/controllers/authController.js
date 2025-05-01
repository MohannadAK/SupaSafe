const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sequelize } = require('../models');
const User = require('../models/user')(sequelize);
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'; // Will use environment variable in production
// KEY_ENCRYPTION_SECRET must be exactly 32 bytes (256 bits) for AES-256
const KEY_ENCRYPTION_SECRET = process.env.KEY_ENCRYPTION_SECRET || crypto.randomBytes(32).toString('base64');
const BCRYPT_WORK_FACTOR = 12; // Updated to meet NFR1 requirement
const PBKDF2_ITERATIONS = 100000; // As per NFR2

/**
 * Generates a random DEK and encrypts it with the KEK derived from the password
 * @param {string} password - User's master password
 * @param {string} salt - Base64 encoded salt
 * @returns {Object} Object containing encryptedDEK and dekIV
 */
function generateEncryptedDEK(password, salt) {
  // Generate a random 32-byte DEK
  const dek = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  // Derive KEK using PBKDF2 (NFR2)
  const key = crypto.pbkdf2Sync(
    password,
    Buffer.from(salt, 'base64'),
    PBKDF2_ITERATIONS,
    32,
    'sha256'
  );

  // Encrypt DEK with KEK using AES-256-CBC (NFR3)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encryptedDEK = cipher.update(dek, 'binary', 'base64');
  encryptedDEK += cipher.final('base64');

  return {
    encryptedDEK, // No truncation to ensure data integrity
    dekIV: iv.toString('base64')
  };
}

/**
 * Encrypts the KEK with the server-side secret
 * @param {Buffer} kek - Key Encryption Key
 * @returns {Object} Object containing encryptedKEK and kekIV
 */
function encryptKEK(kek) {
  const iv = crypto.randomBytes(16);

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

    const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);

    let encrypted = cipher.update(kek, 'binary', 'base64');
    encrypted += cipher.final('base64');

    return {
      encryptedKEK: encrypted, // No truncation to ensure data integrity
      kekIV: iv.toString('base64')
    };
  } catch (error) {
    console.error('Error encrypting KEK:', error);
    throw new Error(`Failed to encrypt KEK: ${error.message}`);
  }
}

/**
 * Middleware to decrypt KEK from JWT
 */
exports.decryptKEK = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const { encryptedKEK, kekIV } = payload;

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
      Buffer.from(kekIV, 'base64')
    );

    let decrypted = decipher.update(Buffer.from(encryptedKEK, 'base64'), 'base64', 'binary');
    decrypted += decipher.final('binary');

    req.kek = Buffer.from(decrypted, 'binary');
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Register a new user (FR1)
 */
exports.register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Generate a random salt (NFR2)
    const salt = crypto.randomBytes(16).toString('base64');

    // Hash the password with bcrypt (NFR1)
    const hashedPass = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    // Derive KEK from password and salt (NFR2)
    const kek = crypto.pbkdf2Sync(
      password,
      Buffer.from(salt, 'base64'),
      PBKDF2_ITERATIONS,
      32,
      'sha256'
    );

    // Generate and encrypt DEK (NFR3)
    const { encryptedDEK, dekIV } = generateEncryptedDEK(password, salt);

    // Encrypt KEK for JWT (NFR5)
    const { encryptedKEK, kekIV } = encryptKEK(kek);

    // Create the user in the database
    const newUser = await User.create({
      email,
      hashedPass,
      salt,
      encryptedDEK,
      dekIV,
      keyCreationDate: new Date() // Added to comply with the schema
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        encryptedKEK,
        kekIV
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      message: 'Registration successful',
      user: { id: newUser.id, email: newUser.email },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
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
    // Find the user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.hashedPass);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Derive KEK from password and stored salt
    const kek = crypto.pbkdf2Sync(
      password,
      Buffer.from(user.salt, 'base64'),
      PBKDF2_ITERATIONS,
      32,
      'sha256'
    );

    // Encrypt KEK for JWT
    const { encryptedKEK, kekIV } = encryptKEK(kek);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        encryptedKEK,
        kekIV
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, email: user.email },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
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
  try {
    // No server-side token invalidation is specified in the SRS
    // Client will clear the JWT from localStorage
    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      error: 'Server error during logout',
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
    const user = await User.findOne({
      where: { id: userId },
      attributes: ['id', 'email']
    });

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
    // Find the user
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.hashedPass);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Derive old KEK from current password
    const oldKEK = crypto.pbkdf2Sync(
      currentPassword,
      Buffer.from(user.salt, 'base64'),
      PBKDF2_ITERATIONS,
      32,
      'sha256'
    );

    // Decrypt DEK with old KEK
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      oldKEK,
      Buffer.from(user.dekIV, 'base64')
    );

    let decryptedDEK = decipher.update(user.encryptedDEK, 'base64', 'binary');
    decryptedDEK += decipher.final('binary');
    decryptedDEK = Buffer.from(decryptedDEK, 'binary');

    // Generate new salt for new KEK
    const newSalt = crypto.randomBytes(16).toString('base64');

    // Derive new KEK from new password
    const newKEK = crypto.pbkdf2Sync(
      newPassword,
      Buffer.from(newSalt, 'base64'),
      PBKDF2_ITERATIONS,
      32,
      'sha256'
    );

    // Re-encrypt DEK with new KEK
    const newIV = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', newKEK, newIV);
    let newEncryptedDEK = cipher.update(decryptedDEK, 'binary', 'base64');
    newEncryptedDEK += cipher.final('base64');

    // Hash new password with bcrypt
    const newHashedPass = await bcrypt.hash(newPassword, BCRYPT_WORK_FACTOR);

    // Update user record
    await user.update({
      hashedPass: newHashedPass,
      salt: newSalt,
      encryptedDEK: newEncryptedDEK,
      dekIV: newIV.toString('base64'),
      lastUpdate: new Date()
    });

    // Generate new JWT with new KEK
    const { encryptedKEK, kekIV } = encryptKEK(newKEK);
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        encryptedKEK,
        kekIV
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'Password updated successfully',
      token
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      error: 'Server error during password change',
      details: error.message
    });
  }
};

/**
 * Generate a secure random password
 * @param {number} length - Length of the password (8-32 characters)
 * @returns {string} Randomly generated password
 */
exports.generatePassword = (length = 16) => {
  // Ensure length is within valid range
  const passwordLength = Math.min(Math.max(length, 8), 32);

  // Define character sets
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specials = '!@#$%^&*()';
  const allChars = uppercase + lowercase + numbers + specials;

  // Generate random password
  let password = '';

  // Ensure at least one character from each set
  password += uppercase.charAt(Math.floor(crypto.randomInt(uppercase.length)));
  password += lowercase.charAt(Math.floor(crypto.randomInt(lowercase.length)));
  password += numbers.charAt(Math.floor(crypto.randomInt(numbers.length)));
  password += specials.charAt(Math.floor(crypto.randomInt(specials.length)));

  // Fill the rest with random characters
  for (let i = 4; i < passwordLength; i++) {
    password += allChars.charAt(Math.floor(crypto.randomInt(allChars.length)));
  }

  // Shuffle the password characters
  password = password.split('').sort(() => 0.5 - Math.random()).join('');

  return password;
};