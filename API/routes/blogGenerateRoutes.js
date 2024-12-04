// routes/generate.js
const express = require('express');
const router = express.Router();
const { generateContent, fetchGeneratedContent, publishContent, deleteContent } = require('../controllers/blogGenerateController');
const authenticateJWT = require('../middleware/authMiddleware');

router.post('/generate', authenticateJWT, generateContent);
router.get('/content', authenticateJWT, fetchGeneratedContent);
router.post('/publish/:id', authenticateJWT, publishContent);
router.delete('/content/:id', authenticateJWT, deleteContent);

module.exports = router;
