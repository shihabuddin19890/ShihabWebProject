const db = require('../models/db');

const requestCredits = (req, res) => {
    const user_id = req.user.id;
    const { requested_credits } = req.body;

    const insertSql = 'INSERT INTO credit_requests (user_id, requested_credits) VALUES (?, ?)';
    db.query(insertSql, [user_id, requested_credits], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Credit request submitted successfully.' });
    });
};

const fetchCreditRequests = (req, res) => {
    const sql = `
        SELECT cr.id, u.username, cr.requested_credits, cr.approved, cr.created_at, cr.approved_at 
        FROM credit_requests cr
        JOIN users u ON cr.user_id = u.id
        WHERE cr.approved = FALSE
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

const approveCreditRequest = (req, res) => {
    const { requestId } = req.params;
    const sqlFetch = 'SELECT * FROM credit_requests WHERE id = ? AND approved = FALSE';

    db.query(sqlFetch, [requestId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Credit request not found or already approved.' });

        const creditRequest = results[0];
        const updateUserCreditsSql = 'UPDATE users SET credits = credits + ? WHERE id = ?';
        db.query(updateUserCreditsSql, [creditRequest.requested_credits, creditRequest.user_id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            const updateRequestSql = 'UPDATE credit_requests SET approved = TRUE, approved_at = NOW() WHERE id = ?';
            db.query(updateRequestSql, [requestId], (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Credit request approved successfully.' });
            });
        });
    });
};

module.exports = { requestCredits, fetchCreditRequests, approveCreditRequest };
