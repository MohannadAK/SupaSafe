const crypto = require('crypto');
const bcrypt = require('bcrypt');
const authConfig = require('../config/auth');

/**
 * Cryptographic service for password management operations
 */
class CryptoService {

    /**
     * Hash a master password using bcrypt
     * @param {string} masterPassword - The plain text master password
     * @returns {Promise<{hash: string, salt: string}>} - The bcrypt hash and salt
     */
    async hashMasterPassword(masterPassword) {
        const salt = await bcrypt.genSalt(authConfig.bcryptSaltRounds);
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
     * Generate an Initialization Vector (IV)
     * @returns {Buffer} - 16-byte random IV
     */
    generateIV() {
        return this.generateRandomBytes(16); // 128 bits
    }

    /**
     * Derive a Key Encryption Key (KEK) from master password and salt
     * @param {string} masterPassword - The plain text master password
     * @param {string} salt - Base64 encoded salt
     * @returns {Buffer} - 32-byte derived key
     */
    deriveKEK(masterPassword, salt) {
        const saltBuffer = Buffer.from(salt, 'base64');
        return crypto.pbkdf2Sync(
            masterPassword,
            saltBuffer,
            authConfig.pbkdf2Iterations,
            authConfig.pbkdf2KeyLength,
            authConfig.pbkdf2Digest
        );
    }

    /**
     * Encrypt a DEK with a KEK
     * @param {Buffer} dek - Data Encryption Key
     * @param {Buffer} kek - Key Encryption Key
     * @returns {{encryptedDEK: string, iv: string}} - Base64 encoded encrypted DEK and IV
     */
    encryptDEK(dek, kek) {
        const iv = this.generateIV();
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
     * Encrypt data with the DEK
     * @param {string} data - Plain text data to encrypt
     * @param {Buffer} dek - Data Encryption Key
     * @returns {{encryptedData: string, iv: string}} - Base64 encoded encrypted data and IV
     */
    encryptWithDEK(data, dek) {
        const iv = this.generateIV();
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
     * Encrypt the KEK with the server-side secret for JWT storage
     * @param {Buffer} kek - Key Encryption Key
     * @returns {string} - Base64 encoded encrypted KEK
     */
    encryptKEKForJWT(kek) {
        const secret = authConfig.keyEncryptionSecret;
        const iv = this.generateIV();

        // Create a 32-byte key from the secret
        const keyBuffer = crypto.createHash('sha256').update(secret).digest();

        const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);

        let encryptedKEK = cipher.update(kek);
        encryptedKEK = Buffer.concat([encryptedKEK, cipher.final()]);

        // Combine IV and encrypted KEK for storage in JWT
        return Buffer.concat([iv, encryptedKEK]).toString('base64');
    }

    /**
     * Decrypt the KEK from JWT token
     * @param {string} encryptedKEK - Base64 encoded encrypted KEK from JWT
     * @returns {Buffer} - Decrypted KEK
     */
    decryptKEKFromJWT(encryptedKEK) {
        const secret = authConfig.keyEncryptionSecret;
        const buffer = Buffer.from(encryptedKEK, 'base64');

        // Extract IV (first 16 bytes) and encrypted KEK
        const iv = buffer.slice(0, 16);
        const encryptedData = buffer.slice(16);

        // Create a 32-byte key from the secret
        const keyBuffer = crypto.createHash('sha256').update(secret).digest();

        const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv);

        let decryptedKEK = decipher.update(encryptedData);
        decryptedKEK = Buffer.concat([decryptedKEK, decipher.final()]);

        return decryptedKEK;
    }

    /**
     * Generate a random password
     * @param {number} length - Password length (default: 16)
     * @returns {string} - Random password
     */
    generatePassword(length = 16) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        let password = '';

        // Ensure at least one character from each category
        password += this.getRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        password += this.getRandomChar('abcdefghijklmnopqrstuvwxyz');
        password += this.getRandomChar('0123456789');
        password += this.getRandomChar('!@#$%^&*()');

        // Fill the rest of the password
        for (let i = 4; i < length; i++) {
            const randomIndex = crypto.randomInt(0, charset.length);
            password += charset[randomIndex];
        }

        // Shuffle the password characters
        return this.shuffleString(password);
    }

    /**
     * Get a random character from a string
     * @param {string} characters - String of characters to choose from
     * @returns {string} - A random character
     */
    getRandomChar(characters) {
        const randomIndex = crypto.randomInt(0, characters.length);
        return characters[randomIndex];
    }

    /**
     * Shuffle a string
     * @param {string} str - String to shuffle
     * @returns {string} - Shuffled string
     */
    shuffleString(str) {
        const array = str.split('');
        for (let i = array.length - 1; i > 0; i--) {
            const j = crypto.randomInt(0, i + 1);
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array.join('');
    }
}

module.exports = new CryptoService();