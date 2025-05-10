const express = require('express');
const passwordController = require('../controllers/passwordsController');
const { authenticateJWT } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/passwords/sites:
 *   get:
 *     summary: Retrieve all stored site info (excluding password) for the logged-in user
 *     description: Retrieves a list of site information (e.g., website URLs, usernames) associated with the authenticated user, excluding sensitive password data.
 *     tags: [Passwords]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Site info retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sites retrieved successfully
 *                 sites:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: uuid-1234
 *                       username:
 *                         type: string
 *                         example: johndoe
 *                       siteName:
 *                         type: string
 *                         example: GitHub
 *                       websiteUrl:
 *                         type: string
 *                         example: github.com
 *                       creationDate:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-05-03T12:00:00Z
 *                       lastUpdate:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-05-03T12:00:00Z
 *       401:
 *         description: Unauthorized, invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Authentication required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error during site info retrieval
 */
router.get('/sites', authenticateJWT, passwordController.getSites);

/**
 * @swagger
 * /api/passwords:
 *   post:
 *     summary: Add a new password for the logged-in user
 *     description: Adds a new password entry for the authenticated user, encrypting the password before storage.
 *     tags: [Passwords]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - websiteUrl
 *               - username
 *               - password
 *               - siteName
 *             properties:
 *               websiteUrl:
 *                 type: string
 *                 example: github.com
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: MySecureP@ss123
 *               siteName:
 *                 type: string
 *                 example: GitHub
 *                 description: A human-readable name for the site (required)
 *     responses:
 *       201:
 *         description: Password added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password added successfully
 *                 password:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: uuid-1234
 *                     username:
 *                       type: string
 *                       example: johndoe
 *                     siteName:
 *                       type: string
 *                       example: GitHub
 *                     websiteUrl:
 *                       type: string
 *                       example: github.com
 *                     creationDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-05-03T12:00:00Z
 *                     lastUpdate:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-05-03T12:00:00Z
 *       400:
 *         description: Missing required fields or duplicate username for user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Username already exists for this user
 *       401:
 *         description: Unauthorized, invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Authentication required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error during password addition
 */
router.post('/', authenticateJWT, passwordController.addPassword);

/**
 * @swagger
 * /api/passwords/{passwordId}:
 *   get:
 *     summary: Retrieve a password for the logged-in user
 *     description: Retrieves a specific password entry for the authenticated user, decrypting the password for the response.
 *     tags: [Passwords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: passwordId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the password to retrieve
 *     responses:
 *       200:
 *         description: Password retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password retrieved successfully
 *                 password:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: uuid-1234
 *                     username:
 *                       type: string
 *                       example: johndoe
 *                     siteName:
 *                       type: string
 *                       example: GitHub
 *                     websiteUrl:
 *                       type: string
 *                       example: github.com
 *                     password:
 *                       type: string
 *                       example: MySecureP@ss123
 *                     creationDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-05-03T12:00:00Z
 *                     lastUpdate:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-05-03T12:00:00Z
 *       400:
 *         description: Password ID is required
 *       403:
 *         description: Unauthorized to access this password
 *       404:
 *         description: Password not found
 *       500:
 *         description: Server error during password retrieval
 */
router.get('/:passwordId', authenticateJWT, passwordController.getPasswordById);

/**
 * @swagger
 * /api/passwords/{passwordId}:
 *   delete:
 *     summary: Delete a password for the logged-in user
 *     description: Deletes a specific password entry for the authenticated user.
 *     tags: [Passwords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: passwordId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the password to delete
 *     responses:
 *       200:
 *         description: Password deleted successfully
 *       400:
 *         description: Password ID is required
 *       403:
 *         description: Unauthorized to delete this password
 *       404:
 *         description: Password not found
 *       500:
 *         description: Server error during password deletion
 */
router.delete('/:passwordId', authenticateJWT, passwordController.deletePassword);

/**
 * @swagger
 * /api/passwords/{passwordId}:
 *   put:
 *     summary: Update an existing password for the logged-in user
 *     description: Updates a specific password entry for the authenticated user. At least one field must be provided.
 *     tags: [Passwords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: passwordId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the password to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               websiteUrl:
 *                 type: string
 *                 example: github.com
 *               username:
 *                 type: string
 *                 example: newUser123
 *               password:
 *                 type: string
 *                 example: UpdatedPass456
 *               siteName:
 *                 type: string
 *                 example: GitHub
 *                 description: A human-readable name for the site
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password updated successfully
 *                 password:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: uuid-1234
 *                     username:
 *                       type: string
 *                       example: newUser123
 *                     siteName:
 *                       type: string
 *                       example: GitHub
 *                     websiteUrl:
 *                       type: string
 *                       example: github.com
 *                     creationDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-05-03T12:00:00Z
 *                     lastUpdate:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-05-03T12:00:00Z
 *       400:
 *         description: Invalid request, missing ID, or duplicate username for user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Username already exists for this user
 *       403:
 *         description: Unauthorized to update this password
 *       404:
 *         description: Password not found
 *       500:
 *         description: Server error during password update
 */
router.put('/:passwordId', authenticateJWT, passwordController.updatePassword);

module.exports = router;