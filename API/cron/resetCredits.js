const cron = require('node-cron');
const db = require('../models/db');

const resetCredits = () => {
    const userTypes = {
        free: 3000,
        pro: 20000,
        pro_plus: 50000
    };

    for (const [type, credits] of Object.entries(userTypes)) {
        const sql = `UPDATE users SET credits = ? WHERE user_type = ?`;
        db.query(sql, [credits, type], (err, result) => {
            if (err) {
                console.error(`Error resetting credits for ${type}:`, err.message);
            } else {
                console.log(`Credits reset for ${type}`);
            }
        });
    }
};

// Schedule the task to run on the first day of every month at midnight
cron.schedule('0 0 1 * *', resetCredits);
