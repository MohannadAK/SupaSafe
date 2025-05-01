module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-for-jwt',
    jwtExpiresIn: '24h',
    keyEncryptionSecret: process.env.KEY_ENCRYPTION_SECRET || 'your-key-encryption-secret',
    bcryptSaltRounds: 12,
    pbkdf2Iterations: 100000,
    pbkdf2KeyLength: 32,
    pbkdf2Digest: 'sha256'
};