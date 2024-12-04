const db = require('../models/db');

const getUserCredits = (req, res) => {
    const user_id = req.user.id;
    const sql = 'SELECT credits FROM users WHERE id = ?';
    db.query(sql, [user_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ credits: results[0].credits });
    });
};

const getUsers = (req, res) => {
    const sql = `
        SELECT u.id, u.username, u.email, u.user_type as role
        FROM users u
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

const getRoles = (req, res) => {
    const sql = 'SELECT * FROM roles';

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

const getRolePermissions = (req, res) => {
    const { roleId } = req.params;

    const sql = `
        SELECT p.permission_name
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = ?
    `;

    db.query(sql, [roleId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const permissions = results.map(row => row.permission_name);
        res.json({ permissions });
    });
}

const updateUserRole = (req, res) => {
    const { userId, roleId } = req.body;

    const updateUserRoleSql = 'UPDATE users SET user_type = ? WHERE id = ?';

    db.query(updateUserRoleSql, [roleId, userId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User role updated successfully' });
    });
};

const updateRolePermissions = (req, res) => {
    const { roleId, permissions } = req.body;

    const getPermissionIdsSql = 'SELECT id FROM permissions WHERE permission_name IN (?)';
    const deleteRolePermissionsSql = 'DELETE FROM role_permissions WHERE role_id = ?';
    const insertRolePermissionSql = 'INSERT INTO role_permissions (role_id, permission_id) VALUES ?';

    db.query(getPermissionIdsSql, [permissions], (err, permissionResults) => {
        if (err) return res.status(500).json({ error: err.message });

        const permissionIds = permissionResults.map(row => row.id);

        db.query(deleteRolePermissionsSql, [roleId], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            const values = permissionIds.map(permissionId => [roleId, permissionId]);
            db.query(insertRolePermissionSql, [values], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Role permissions updated successfully' });
            });
        });
    });
};

const getPermissions = (req, res) => {
    const sql = 'SELECT permission_name FROM permissions';

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const permissions = results.map(row => row.permission_name);
        res.json(permissions);
    });
};

module.exports = { getUserCredits, getPermissions, getUsers, getRoles, getRolePermissions, updateUserRole, updateRolePermissions };
