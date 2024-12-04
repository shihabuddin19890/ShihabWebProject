const express = require('express');
const router = express.Router();
const db = require('../models/db');
const authenticateJWT = require('../middleware/authMiddleware');

// Get the role of the current user
router.get('/role', authenticateJWT, (req, res) => {
    const userId = req.user.id;

    const sql = `
    SELECT user_type AS role_name 
    FROM users 
    WHERE id = ?
  `;

    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            res.json({ role_name: results[0].role_name });
        } else {
            res.status(404).json({ message: 'Role not found' });
        }
    });
});

// Get all users (for super admin)
router.get('/users', authenticateJWT, (req, res) => {
    const sql = 'SELECT id, username, approved FROM users';

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get current user permissions
router.get('/permissions', authenticateJWT, (req, res) => {
    const userId = req.user.id;

    const sql = `
      SELECT p.permission_name 
      FROM users u
      JOIN role_permissions rp ON u.user_type = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE u.id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const permissions = results.map(row => row.permission_name);
        res.json({ permissions });
    });
});

router.get("/", authenticateJWT, (req, res) => {
    const user_id = req.user.id;

    const sql = `
    SELECT 
        *
        FROM users u WHERE u.id = ?
    
`;

    db.query(sql, [user_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = results[0];
        user.permissions = user.permissions ? user.permissions.split(',') : [];

        res.json(user);
    });
});

module.exports = router;
