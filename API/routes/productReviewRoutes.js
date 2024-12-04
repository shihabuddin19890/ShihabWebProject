const express = require('express');
const router = express.Router();
const { saveProductReview, generateProductReview, fetchGeneratedProductReviews, publishProductReview, deleteProductReview } = require('../controllers/productReviewController');
const authenticateJWT = require('../middleware/authMiddleware');

// Route to generate a product review
router.post('/generate-product-review', authenticateJWT, generateProductReview);

// Route to save product review to DB
router.post('/save', authenticateJWT, saveProductReview);

// Route to fetch previous product reviews
router.get('/generated-product-reviews', authenticateJWT, fetchGeneratedProductReviews);

// Route to publish a product review
router.post('/publish-product-review/:id', authenticateJWT, publishProductReview);

// Route to delete a product review
router.delete('/delete-product-review/:id', authenticateJWT, deleteProductReview);

module.exports = router;
