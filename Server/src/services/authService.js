/**
 * File: services/authService.js
 * Description: Authentication service that uses cryptoService
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const cryptoService = require('./cryptoService');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

/**
 * Authentication service
 */
class AuthService {
    /**
     * Create a new user account (FR1)
     * @param {string} email - User email
     * @param {string} password - User master password
     * @returns {Promise<{user: Object, token: string}>} - Created user and token
     */
    async signup(email, password) {
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash the master password
        const { hash: hashedPass, salt: bcryptSalt } = await cryptoService.hashMasterPassword(password);

        // Generate a new salt for PBKDF2 derivation of KEK
        const salt = cryptoService.generateRandomBytes(16).toString('base64');

        // Derive the KEK from the master password and salt
        const kek = cryptoService.deriveKEK(password, salt);

        // Generate a random DEK
        const dek = cryptoService.generateDEK();

        // Encrypt the DEK with the KEK
        const { encryptedDEK, iv: dekIV } = cryptoService.encryptDEK(dek, kek);

        // Initialize token version to 0
        const tokenVersion = 0;

        // Create the user in the database
        const newUser = await User.create({
            email,
            hashedPass,
            salt,
            encryptedDEK,
            dekIV,
            keyCreationDate: new Date(),
            creationDate: new Date(),
            lastUpdate: new Date(),
            tokenVersion
        });

        // Encrypt KEK for JWT
        const { encryptedKEK, kekIV } = cryptoService.encryptKEKForJWT(kek);

        // Generate JWT token
        const token = jwt.sign(
            {
                id: newUser.id,
                email: newUser.email,
                encryptedKEK,
                kekIV,
                tokenVersion // Include token version in the JWT
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return {
            user: { id: newUser.id, email: newUser.email },
            token
        };
    }

    /**
     * Authenticate a user and return a JWT (FR2)
     * @param {string} email - User email
     * @param {string} password - User master password
     * @returns {Promise<{token: string, user: Object}>} - JWT and user object
     */
    async login(email, password) {
        // Find the user by email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verify the master password
        const isValid = await cryptoService.verifyMasterPassword(password, user.hashedPass);

        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        // Derive the KEK from the master password and salt
        const kek = cryptoService.deriveKEK(password, user.salt);

        // Encrypt KEK for JWT
        const { encryptedKEK, kekIV } = cryptoService.encryptKEKForJWT(kek);

        // Create and sign the JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                encryptedKEK,
                kekIV,
                tokenVersion: user.tokenVersion // Include token version in the JWT
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return {
            token,
            user: { id: user.id, email: user.email }
        };
    }

    /**
     * Get user by ID
     * @param {number} userId - User ID
     * @returns {Promise<Object>} - User object
     */
    async getUser(userId) {
        const user = await User.findOne({
            where: { id: userId },
            attributes: ['id', 'email']
        });

        return user;
    }

    /**
     * Change a user's master password (FR6)
     * @param {number} userId - User ID
     * @param {string} currentPassword - Current master password
     * @param {string} newPassword - New master password
     * @returns {Promise<{token: string}>} - New JWT
     */
    async changeMasterPassword(userId, currentPassword, newPassword) {
        // Find the user
        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            throw new Error('User not found');
        }

        // Verify current password
        const isValid = await cryptoService.verifyMasterPassword(currentPassword, user.hashedPass);

        if (!isValid) {
            throw new Error('Current password is incorrect');
        }

        // Derive old KEK from current password
        const oldKEK = cryptoService.deriveKEK(currentPassword, user.salt);

        // Decrypt DEK with old KEK
        const dek = cryptoService.decryptDEK(user.encryptedDEK, user.dekIV, oldKEK);

        // Generate new salt and hash password
        const { hash: newHashedPass } = await cryptoService.hashMasterPassword(newPassword);
        const newSalt = cryptoService.generateRandomBytes(16).toString('base64');

        // Derive new KEK from new password
        const newKEK = cryptoService.deriveKEK(newPassword, newSalt);

        // Re-encrypt DEK with new KEK
        const { encryptedDEK: newEncryptedDEK, iv: newDekIV } = cryptoService.encryptDEK(dek, newKEK);

        // Increment token version to invalidate old tokens
        const newTokenVersion = (user.tokenVersion || 0) + 1;

        // Update user record
        await user.update({
            hashedPass: newHashedPass,
            salt: newSalt,
            encryptedDEK: newEncryptedDEK,
            dekIV: newDekIV,
            lastUpdate: new Date(),
            tokenVersion: newTokenVersion
        });

        // Encrypt new KEK for JWT
        const { encryptedKEK, kekIV } = cryptoService.encryptKEKForJWT(newKEK);

        // Generate new JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                encryptedKEK,
                kekIV,
                tokenVersion: newTokenVersion // Include updated token version in the JWT
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return { token };
    }

    /**
     * Get the DEK for a user using the KEK from the request
     * @param {number} userId - User ID
     * @param {Buffer} kek - Key Encryption Key
     * @returns {Promise<Buffer>} - Decrypted DEK
     */
    async getDEK(userId, kek) {
        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            throw new Error('User not found');
        }

        return cryptoService.decryptDEK(user.encryptedDEK, user.dekIV, kek);
    }
}

module.exports = new AuthService();