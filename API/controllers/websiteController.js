// controllers/websiteController.js
const db = require('../models/db');

const updateWebsiteInfo = (req, res) => {
    const { wordpress_url, wordpress_username, wordpress_password } = req.body;
    const user_id = req.user.id;

    const sql = 'REPLACE INTO user_websites (user_id, wordpress_url, wordpress_username, wordpress_password) VALUES (?, ?, ?, ?)';
    db.query(sql, [user_id, wordpress_url, wordpress_username, wordpress_password], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: 'Website info updated successfully!' });
    });
};

const getWebsiteInfo = (req, res) => {
    const user_id = req.user.id;

    const sql = 'SELECT * FROM user_websites WHERE user_id = ?';
    db.query(sql, [user_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'No website info found for this user.' });
        }
        res.status(200).json(results[0]);
    });
};

module.exports = { updateWebsiteInfo, getWebsiteInfo };
