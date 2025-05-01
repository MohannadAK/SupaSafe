const jwt = require('jsonwebtoken');
const { User } = require('../models');
const cryptoService = require('./cryptoService');
const authConfig = require('../config/auth');

/**
 * Authentication service
 */
class AuthService {
    /**
     * Create a new user account
     * @param {string} email - User email
     * @param {string} masterPassword - User master password
     * @returns {Promise<{user: User, kek: Buffer}>} - Created user and derived KEK
     */
    async signup(email, masterPassword) {
        // Hash the master password
        const { hash, salt } = await cryptoService.hashMasterPassword(masterPassword);

        // Generate a new salt for PBKDF2 derivation of KEK
        const pbkdf2Salt = cryptoService.generateRandomBytes(16).toString('base64');

        // Derive the KEK from the master password and salt
        const kek = cryptoService.deriveKEK(masterPassword, pbkdf2Salt);

        // Generate a random DEK
        const dek = cryptoService.generateDEK();

        // Encrypt the DEK with the KEK
        const { encryptedDEK, iv } = cryptoService.encryptDEK(dek, kek);

        // Create the user in the database
        const user = await User.create({
            email,
            hashedPass: hash,
            salt: pbkdf2Salt,
            encryptedDEK,
            dekIV: iv
        });

        return { user, kek };
    }

    /**
     * Authenticate a user and return a JWT
     * @param {string} email - User email
     * @param {string} masterPassword - User master password
     * @returns {Promise<{token: string, user: User}>} - JWT and user object
     */
    async login(email, masterPassword) {
        // Find the user by email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            throw new Error('User not found');
        }

        // Verify the master password
        const isValid = await cryptoService.verifyMasterPassword(masterPassword, user.hashedPass);

        if (!isValid) {
            throw new Error('Invalid password');
        }

        // Derive the KEK from the master password and salt
        const kek = cryptoService.deriveKEK(masterPassword, user.salt);

        // Encrypt the KEK for storage in the JWT
        const encryptedKEK = cryptoService.encryptKEKForJWT(kek);

        // Create and sign the JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                kek: encryptedKEK
            },
            authConfig.jwtSecret,
            { expiresIn: authConfig.jwtExpiresIn }
        );

        return { token, user };
    }

    /**
     * Change a user's master password
     * @param {string} userId - User ID
     * @param {string} currentPassword - Current master password
     * @param {string} newPassword - New master password
     * @returns {Promise<{token: string, user: User}>} - New JWT and updated user
     */
    async changeMasterPassword(userId, currentPassword, newPassword) {
        // Find the user
        const user = await User.findByPk(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // Verify the current password
        const isValid = await cryptoService.verifyMasterPassword(currentPassword, user.hashedPass);

        if (!isValid) {
            throw new Error('Invalid current password');
        }

        // Derive the old KEK to decrypt the DEK
        const oldKEK = cryptoService.deriveKEK(currentPassword, user.salt);

        // Decrypt the DEK using the old KEK
        const dek = cryptoService.decryptDEK(user.encryptedDEK, user.dekIV, oldKEK);

        // Generate a new hash and salt for the new master password
        const { hash, salt } = await cryptoService.hashMasterPassword(newPassword);

        // Generate a new salt for PBKDF2 derivation of new KEK
        const newPbkdf2Salt = cryptoService.generateRandomBytes(16).toString('base64');

        // Derive the new KEK from the new master password and salt
        const newKEK = cryptoService.deriveKEK(newPassword, newPbkdf2Salt);

        // Re-encrypt the DEK with the new KEK
        const { encryptedDEK, iv } = cryptoService.encryptDEK(dek, newKEK);

        // Update the user in the database
        user.hashedPass = hash;
        user.salt = newPbkdf2Salt;
        user.encryptedDEK = encryptedDEK;
        user.dekIV = iv;
        user.lastUpdate = new Date();
        user.keyCreationDate = new Date();

        await user.save();

        // Encrypt the new KEK for storage in the JWT
        const encryptedKEK = cryptoService.encryptKEKForJWT(newKEK);

        // Create and sign a new JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                kek: encryptedKEK
            },
            authConfig.jwtSecret,
            { expiresIn: authConfig.jwtExpiresIn }
        );

        return { token, user };
    }

    /**
     * Get the DEK for a user from JWT and encrypted DEK
     * @param {Object} decodedToken - Decoded JWT
     * @param {User} user - User object
     * @returns {Buffer} - Decrypted DEK
     */
    getDEKFromJWT(decodedToken, user) {
        // Decrypt the KEK from the JWT
        const kek = cryptoService.decryptKEKFromJWT(decodedToken.kek);

        // Decrypt the DEK using the KEK
        return cryptoService.decryptDEK(user.encryptedDEK, user.dekIV, kek);
    }
}

module.exports = new AuthService();