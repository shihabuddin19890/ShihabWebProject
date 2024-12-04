// controllers/authController.js
const db = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require("dotenv").config()
const jwtSecret = process.env.ACCESS_TOKEN_SECRET;


const register = async (req, res) => {
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultUserType = 'free';
    const defaultMonthlyCredits = 1000;
    const defaultCredits = 1000;

    const sql = 'INSERT INTO users (username, password, email, user_type, monthly_credit, credits) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [username, hashedPassword, email, defaultUserType, defaultMonthlyCredits, defaultCredits], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'User registered successfully!' });
    });
};

const login = (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const token = jwt.sign({ id: user.id, username: user.username }, jwtSecret, { expiresIn: '1h' });
        res.json({ token });
    });
};

module.exports = { register, login };
