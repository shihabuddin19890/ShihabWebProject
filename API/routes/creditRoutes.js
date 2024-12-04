const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/authMiddleware');
const checkSuperAdmin = require('../middleware/checkSuperAdmin');
const { requestCredits, fetchCreditRequests, approveCreditRequest } = require('../controllers/creditController');

router.post('/request', authenticateJWT, requestCredits);
router.get('/requests', authenticateJWT, checkSuperAdmin, fetchCreditRequests);
router.post('/approve/:requestId', authenticateJWT, checkSuperAdmin, approveCreditRequest);

module.exports = router;
