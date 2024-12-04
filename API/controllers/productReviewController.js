const axios = require('axios');
const db = require('../models/db');
require('dotenv').config();

const checkAndDeductCredits = (user_id, requiredCredits, callback) => {
    const sql = 'SELECT credits FROM users WHERE id = ?';
    db.query(sql, [user_id], (err, results) => {
        if (err) return callback(err);
        const userCredits = results[0].credits;
        if (userCredits < requiredCredits) {
            return callback(new Error('Insufficient credits'));
        }

        const updateCreditsSql = 'UPDATE users SET credits = credits - ? WHERE id = ?';
        db.query(updateCreditsSql, [requiredCredits, user_id], (err, result) => {
            if (err) return callback(err);
            callback(null);
        });
    });
};

const publishToWordpress = async (title, content, wordpress_url, wordpress_username, wordpress_password) => {
    const auth = Buffer.from(`${wordpress_username}:${wordpress_password}`).toString('base64');

    const response = await axios.post(`${wordpress_url}/wp-json/wp/v2/posts`, {
        title: title,
        content: content,
        status: 'publish'
    }, {
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
        }
    });

    return response.data;
};

const generateContent = async (req, res) => {
    const { prompt, productTitle, productLink } = req.body;
    const api_key = process.env.CHATGPT_API_KEY;
    const user_id = req.user.id;
    const requiredCredits = 100; // Set the required credits for generating content

    checkAndDeductCredits(user_id, requiredCredits, async (err) => {
        if (err) return res.status(400).json({ error: err.message });

        try {
            const responseTitle = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: `Write a SEO friendly title for this '${prompt}'` },
                ],
                max_tokens: 1000
            }, {
                headers: {
                    'Authorization': `Bearer ${api_key}`,
                    'Content-Type': 'application/json'
                }
            });

            const responseContent = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: prompt },
                ],
                max_tokens: 1000
            }, {
                headers: {
                    'Authorization': `Bearer ${api_key}`,
                    'Content-Type': 'application/json'
                }
            });

            const blogTitle = responseTitle.data.choices[0].message.content;
            const blogContent = responseContent.data.choices[0].message.content;

            const title = blogTitle;
            const insertSql = 'INSERT INTO posts (user_id, title, content, published) VALUES (?, ?, ?, ?)';
            db.query(insertSql, [user_id, title, blogContent, false], (err, result) => {
                if (err) throw err;
                res.json({ message: blogContent });
            });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    })
};

const generateProductReview = async (req, res) => {
    const { customPrompt, productTitle, productLink, contentLanguage } = req.body;
    const api_key = process.env.CHATGPT_API_KEY;
    const user_id = req.user.id;
    const requiredCredits = 100; // Set the required credits for generating content
    const updatedPrompt = 'Here is the instruction for product review: ' + customPrompt + '. Product Title is: ' + productTitle + '. Link: ' + productLink + '. Language: ' + contentLanguage;

    checkAndDeductCredits(user_id, requiredCredits, async (err) => {
        if (err) return res.status(400).json({ error: err.message });

        try {
            const responseContent = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    {
                        role: 'user', content: updatedPrompt
                    },
                ],
                max_tokens: 2000
            }, {
                headers: {
                    'Authorization': `Bearer ${api_key}`,
                    'Content-Type': 'application/json'
                }
            });

            const reviewContent = responseContent.data.choices[0].message.content;


            res.json({ message: reviewContent });


        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    })
};

const saveProductReview = async (req, res) => {
    const { productTitle, productLink, reviews } = req.body;
    const user_id = req.user.id;
    try {
        const insertSql = 'INSERT INTO product_reviews (user_id, product_title, product_link, review_content, published) VALUES (?, ?, ?, ?, ?)';
        db.query(insertSql, [user_id, productTitle, productLink, reviews, false], (err, result) => {
            if (err) throw err;
            res.status(200).json({ message: "Successfull" });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }


}

const fetchGeneratedProductReviews = (req, res) => {
    const user_id = req.user.id;
    const sql = 'SELECT * FROM product_reviews WHERE user_id = ?';
    db.query(sql, [user_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

const publishProductReview = (req, res) => {
    const reviewId = req.params.id;
    const user_id = req.user.id;

    const fetchReviewSql = 'SELECT * FROM product_reviews WHERE id = ? AND user_id = ?';
    db.query(fetchReviewSql, [reviewId, user_id], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Review not found.' });

        const review = results[0];

        const fetchWebsiteInfoSql = 'SELECT * FROM user_websites WHERE user_id = ?';
        db.query(fetchWebsiteInfoSql, [user_id], async (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length === 0) return res.status(404).json({ message: 'Website info not found.' });

            const { wordpress_url, wordpress_username, wordpress_password } = results[0];
            try {
                await publishToWordpress(review.product_title, review.review_content, wordpress_url, wordpress_username, wordpress_password);
                const updateReviewSql = 'UPDATE product_reviews SET published = ? WHERE id = ?';
                db.query(updateReviewSql, [true, reviewId], (err, result) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: 'Review published successfully.' });
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    });
};

const deleteProductReview = (req, res) => {
    const reviewId = req.params.id;
    const user_id = req.user.id;

    const deleteSql = 'DELETE FROM product_reviews WHERE id = ? AND user_id = ?';
    db.query(deleteSql, [reviewId, user_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Review deleted successfully.' });
    });
};

module.exports = { generateContent, generateProductReview, fetchGeneratedProductReviews, publishProductReview, deleteProductReview, saveProductReview };
