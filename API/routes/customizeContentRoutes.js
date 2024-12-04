const express = require('express');
const router = express.Router();
const { generateContentByCommand } = require('../controllers/customizeBlogGenerator');
const authenticateJWT = require('../middleware/authMiddleware');

router.post('/command', authenticateJWT, generateContentByCommand);

module.exports = router;