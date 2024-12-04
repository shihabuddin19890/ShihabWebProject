const express = require('express');
const router = express.Router();
const { getUserCredits, getPermissions, getUsers, getRoles, getRolePermissions, updateUserRole, updateRolePermissions } = require('../controllers/adminController');
const authenticateJWT = require('../middleware/authMiddleware');
const checkSuperAdmin = require('../middleware/checkSuperAdmin');

router.get('/users', authenticateJWT, checkSuperAdmin, getUsers);
router.get('/roles', authenticateJWT, checkSuperAdmin, getRoles);
router.get('/role-permissions/:roleId', authenticateJWT, checkSuperAdmin, getRolePermissions);
router.post('/update-user-role', authenticateJWT, updateUserRole);
router.post('/update-role-permissions', authenticateJWT, checkSuperAdmin, updateRolePermissions);
router.get('/permissions', authenticateJWT, getPermissions);
router.get('/credits', authenticateJWT, getUserCredits);

module.exports = router;
