/**
 * File: services/cryptoService.js
 * Description: Cryptographic service for password management operations
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Constants for cryptographic operations
const BCRYPT_WORK_FACTOR = 12; // Updated to meet NFR1 requirement
const PBKDF2_ITERATIONS = 100000; // As per NFR2
const PBKDF2_KEY_LENGTH = 32; // 256 bits
const PBKDF2_DIGEST = 'sha256';
// KEY_ENCRYPTION_SECRET must be exactly 32 bytes (256 bits) for AES-256
const KEY_ENCRYPTION_SECRET = process.env.KEY_ENCRYPTION_SECRET || crypto.randomBytes(32).toString('base64');

/**
 * Cryptographic service for password management operations
 */
class CryptoService {
    /**
     * Hash a master password using bcrypt (NFR1)
     * @param {string} masterPassword - The plain text master password
     * @returns {Promise<{hash: string, salt: string}>} - The bcrypt hash and salt
     */
    async hashMasterPassword(masterPassword) {
        const salt = await bcrypt.genSalt(BCRYPT_WORK_FACTOR);
        const hash = await bcrypt.hash(masterPassword, salt);
        return { hash, salt };
    }

    /**
     * Verify a master password against its hash
     * @param {string} masterPassword - The plain text master password to verify
     * @param {string} hashedPassword - The stored hashed password
     * @returns {Promise<boolean>} - True if password matches hash
     */
    async verifyMasterPassword(masterPassword, hashedPassword) {
        return await bcrypt.compare(masterPassword, hashedPassword);
    }

    /**
     * Generate a random buffer of specified size
     * @param {number} size - Size in bytes
     * @returns {Buffer} - Random bytes
     */
    generateRandomBytes(size) {
        return crypto.randomBytes(size);
    }

    /**
     * Generate a Data Encryption Key (DEK)
     * @returns {Buffer} - 32-byte random DEK
     */
    generateDEK() {
        return this.generateRandomBytes(32); // 256 bits
    }

    /**
     * Derive a Key Encryption Key (KEK) from master password and salt (NFR2)
     * @param {string} masterPassword - The plain text master password
     * @param {string} salt - Base64 encoded salt
     * @returns {Buffer} - 32-byte derived key
     */
    deriveKEK(masterPassword, salt) {
        const saltBuffer = Buffer.from(salt, 'base64');
        return crypto.pbkdf2Sync(
            masterPassword,
            saltBuffer,
            PBKDF2_ITERATIONS,
            PBKDF2_KEY_LENGTH,
            PBKDF2_DIGEST
        );
    }

    /**
     * Encrypt a DEK with a KEK (NFR3)
     * @param {Buffer} dek - Data Encryption Key
     * @param {Buffer} kek - Key Encryption Key
     * @returns {{encryptedDEK: string, iv: string}} - Base64 encoded encrypted DEK and IV
     */
    encryptDEK(dek, kek) {
        const iv = this.generateRandomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', kek, iv);

        let encryptedDEK = cipher.update(dek);
        encryptedDEK = Buffer.concat([encryptedDEK, cipher.final()]);

        return {
            encryptedDEK: encryptedDEK.toString('base64'),
            iv: iv.toString('base64')
        };
    }

    /**
     * Decrypt a DEK with a KEK
     * @param {string} encryptedDEK - Base64 encoded encrypted DEK
     * @param {string} iv - Base64 encoded IV
     * @param {Buffer} kek - Key Encryption Key
     * @returns {Buffer} - Decrypted DEK
     */
    decryptDEK(encryptedDEK, iv, kek) {
        const encryptedDEKBuffer = Buffer.from(encryptedDEK, 'base64');
        const ivBuffer = Buffer.from(iv, 'base64');

        const decipher = crypto.createDecipheriv('aes-256-cbc', kek, ivBuffer);

        let decryptedDEK = decipher.update(encryptedDEKBuffer);
        decryptedDEK = Buffer.concat([decryptedDEK, decipher.final()]);

        return decryptedDEK;
    }

    /**
     * Encrypt the KEK with the server-side secret for JWT storage (NFR5)
     * @param {Buffer} kek - Key Encryption Key
     * @returns {{encryptedKEK: string, kekIV: string}} - Base64 encoded encrypted KEK and IV
     */
    encryptKEKForJWT(kek) {
        const iv = this.generateRandomBytes(16);

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
                encryptedKEK: encrypted,
                kekIV: iv.toString('base64')
            };
        } catch (error) {
            console.error('Error encrypting KEK:', error);
            throw new Error(`Failed to encrypt KEK: ${error.message}`);
        }
    }

    /**
     * Decrypt the KEK from JWT data
     * @param {string} encryptedKEK - Base64 encoded encrypted KEK
     * @param {string} kekIV - Base64 encoded IV
     * @returns {Buffer} - Decrypted KEK
     */
    decryptKEKFromJWT(encryptedKEK, kekIV) {
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

            const decipher = crypto.createDecipheriv(
                'aes-256-cbc',
                secretKey,
                Buffer.from(kekIV, 'base64')
            );

            let decrypted = decipher.update(Buffer.from(encryptedKEK, 'base64'), 'base64', 'binary');
            decrypted += decipher.final('binary');

            return Buffer.from(decrypted, 'binary');
        } catch (error) {
            console.error('Error decrypting KEK:', error);
            throw new Error(`Failed to decrypt KEK: ${error.message}`);
        }
    }

    /**
     * Encrypt data with the DEK (NFR4)
     * @param {string} data - Plain text data to encrypt
     * @param {Buffer} dek - Data Encryption Key
     * @returns {{encryptedData: string, iv: string}} - Base64 encoded encrypted data and IV
     */
    encryptWithDEK(data, dek) {
        const iv = this.generateRandomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', dek, iv);

        let encryptedData = cipher.update(data, 'utf8', 'base64');
        encryptedData += cipher.final('base64');

        return {
            encryptedData,
            iv: iv.toString('base64')
        };
    }

    /**
     * Decrypt data with the DEK
     * @param {string} encryptedData - Base64 encoded encrypted data
     * @param {string} iv - Base64 encoded IV
     * @param {Buffer} dek - Data Encryption Key
     * @returns {string} - Decrypted data as UTF-8 string
     */
    decryptWithDEK(encryptedData, iv, dek) {
        const ivBuffer = Buffer.from(iv, 'base64');
        const decipher = crypto.createDecipheriv('aes-256-cbc', dek, ivBuffer);

        let decryptedData = decipher.update(encryptedData, 'base64', 'utf8');
        decryptedData += decipher.final('utf8');

        return decryptedData;
    }

    /**
     * Encrypt a password using the DEK
     * @param {string} password - The plain text password to encrypt
     * @param {Buffer} dek - Data Encryption Key
     * @returns {{encryptedPassword: string, iv: string}} - Base64 encoded encrypted password and IV
     */
    encryptPassword(password, dek) {
        try {
            return this.encryptWithDEK(password, dek);
        } catch (error) {
            console.error('Error encrypting password:', error);
            throw new Error(`Failed to encrypt password: ${error.message}`);
        }
    }

    /**
     * Decrypt a password using the DEK
     * @param {string} encryptedPassword - Base64 encoded encrypted password
     * @param {string} iv - Base64 encoded IV
     * @param {Buffer} dek - Data Encryption Key
     * @returns {string} - Decrypted password as UTF-8 string
     */
    decryptPassword(encryptedPassword, iv, dek) {
        try {
            return this.decryptWithDEK(encryptedPassword, iv, dek);
        } catch (error) {
            console.error('Error decrypting password:', error);
            throw new Error(`Failed to decrypt password: ${error.message}`);
        }
    }

    /**
     * Decrypt the DEK from encrypted data using the KEK
     * @param {string} encryptedDEK - Base64 encoded encrypted DEK
     * @param {string} dekIV - Base64 encoded IV for DEK decryption
     * @param {Buffer} kek - Decrypted Key Encryption Key
     * @returns {Buffer} - Decrypted DEK
     */
    getDEK(encryptedDEK, dekIV, kek) {
        try {
            return this.decryptDEK(encryptedDEK, dekIV, kek);
        } catch (error) {
            console.error('Error retrieving DEK:', error);
            throw new Error(`Failed to retrieve DEK: ${error.message}`);
        }
    }
}

module.exports = new CryptoService();
