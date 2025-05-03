const express = require('express');
const passwordController = require('../controllers/passwordsController');
const { authenticateJWT } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/passwords:
 *   post:
 *     summary: Add a new password for the logged-in user
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
 *               - website
 *               - username
 *               - password
 *             properties:
 *               website:
 *                 type: string
 *                 example: github.com
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: MySecureP@ss123
 *     responses:
 *       201:
 *         description: Password added successfully
 *       400:
 *         description: Missing required fields
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
 *               website:
 *                 type: string
 *                 example: github.com
 *               username:
 *                 type: string
 *                 example: newUser123
 *               password:
 *                 type: string
 *                 example: UpdatedPass456
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid request or missing ID
 *       403:
 *         description: Unauthorized to update this password
 *       404:
 *         description: Password not found
 *       500:
 *         description: Server error during password update
 */
router.put('/:passwordId', authenticateJWT, passwordController.updatePassword);

module.exports = router;