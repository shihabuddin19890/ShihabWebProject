// routes/website.js
const express = require('express');
const router = express.Router();
const { updateWebsiteInfo, getWebsiteInfo } = require('../controllers/websiteController');
const authenticateJWT = require('../middleware/authMiddleware');

router.post('/update', authenticateJWT, updateWebsiteInfo);
router.get('/info', authenticateJWT, getWebsiteInfo);

module.exports = router;
