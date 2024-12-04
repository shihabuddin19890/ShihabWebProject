const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/authMiddleware');
const { createPrompt, fetchPrompt, updatePrompt, deletePrompt, fetchPromptByCondition } = require('../controllers/promptController');

//Route to create prompt
router.post('/create', authenticateJWT, createPrompt);

//Route to fetch prompt
router.get('/fetch', fetchPrompt)

//Route to update prompt
router.put("/update/:id", updatePrompt)

//Route to delete prompt
router.delete("/delete/:id", deletePrompt)

//Route for fetch prompt by condition
router.get("/fetch-by-condition/:product_use_for/:product_in_use", fetchPromptByCondition)

module.exports = router;