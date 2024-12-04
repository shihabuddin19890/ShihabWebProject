const express = require('express')
const router = express.Router()
const authenticateJWT = require('../middleware/authMiddleware')
const { getSubscription, getValidateSubscription } = require('../controllers/subscriptionController')

router.get('/', authenticateJWT, getSubscription)
router.get('/validate/:id', authenticateJWT, getValidateSubscription)

module.exports = router