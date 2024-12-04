const db = require('../models/db');

const checkSuperAdmin = (req, res, next) => {
    const userId = req.user.id;

    const checkSuperAdminSql = `
        SELECT user_type
        FROM users
        WHERE id = ? AND user_type = 'superadmin'
    `;

    db.query(checkSuperAdminSql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            // User is superadmin, allow access
            return next();
        } else {
            return res.status(403).json({ message: 'Forbidden' });
        }
    });
};

module.exports = checkSuperAdmin;
