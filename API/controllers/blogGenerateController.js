// controllers/generateController.js
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
    const { customPrompt, promptTitle, promptKeyword, promptTone } = req.body;
    const api_key = process.env.CHATGPT_API_KEY;
    const user_id = req.user.id;
    const requiredCredits = 100; // Set the required credits for generating content
    const updatedPrompt = 'Here is the instruction: ' + customPrompt + '. Blog Title is: ' + promptTitle + '. Keywords: ' + promptKeyword + '. Language: ' + promptTone;

    checkAndDeductCredits(user_id, requiredCredits, async (err) => {
        if (err) return res.status(400).json({ error: err.message });

        try {
            const responseTitle = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: `Write a SEO friendly title for this '${updatedPrompt}'` },
                    // { role: 'user', content: `write me a seo title for this '${prompt}'` }

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
                    { role: 'user', content: updatedPrompt },
                    // { role: 'user', content: `write me a seo title for this '${prompt}'` }

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

const fetchGeneratedContent = (req, res) => {
    const user_id = req.user.id;
    const sql = 'SELECT * FROM posts WHERE user_id = ?';
    db.query(sql, [user_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

const publishContent = (req, res) => {
    const postId = req.params.id;
    const user_id = req.user.id;

    const fetchPostSql = 'SELECT * FROM posts WHERE id = ? AND user_id = ?';
    db.query(fetchPostSql, [postId, user_id], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Post not found.' });

        const post = results[0];

        const fetchWebsiteInfoSql = 'SELECT * FROM user_websites WHERE user_id = ?';
        db.query(fetchWebsiteInfoSql, [user_id], async (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length === 0) return res.status(404).json({ message: 'Website info not found.' });

            const { wordpress_url, wordpress_username, wordpress_password } = results[0];
            try {
                await publishToWordpress(post.title, post.content, wordpress_url, wordpress_username, wordpress_password);
                const updatePostSql = 'UPDATE posts SET published = ? WHERE id = ?';
                db.query(updatePostSql, [true, postId], (err, result) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: 'Content published successfully.' });
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    });
};

const deleteContent = (req, res) => {
    const postId = req.params.id;
    const user_id = req.user.id;

    const deleteSql = 'DELETE FROM posts WHERE id = ? AND user_id = ?';
    db.query(deleteSql, [postId, user_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Content deleted successfully.' });
    });
};

module.exports = { generateContent, fetchGeneratedContent, publishContent, deleteContent };
