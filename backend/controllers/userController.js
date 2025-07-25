const db = require('../config/db');
const { hashPassword } = require('../utils/passwordUtils');
const { logActivity } = require('../utils/logger');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
    try {
        const pool = await db.getPool();
        const result = await pool.request().query(`
            SELECT u.UserID, u.Username, u.FullName, u.Email, u.IsActive, u.BranchID, b.BranchName, u.RoleID, r.RoleName
            FROM Users u
            LEFT JOIN Branches b ON u.BranchID = b.BranchID
            LEFT JOIN Roles r ON u.RoleID = r.RoleID
            ORDER BY u.Username
        `);
        res.status(200).json(result.recordset);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUser = async (req, res, next) => {
    const { id } = req.params;
    const { fullName, email, roleId, branchId, isActive, password } = req.body;

    try {
        const pool = await db.getPool();
        let query = 'UPDATE Users SET FullName = @FullName, Email = @Email, RoleID = @RoleID, BranchID = @BranchID, IsActive = @IsActive';

        const request = pool.request()
            .input('UserID', db.sql.UniqueIdentifier, id)
            .input('FullName', db.sql.NVarChar, fullName)
            .input('Email', db.sql.NVarChar, email)
            .input('RoleID', db.sql.Int, roleId)
            .input('BranchID', db.sql.UniqueIdentifier, branchId)
            .input('IsActive', db.sql.Bit, isActive);

        if (password) {
            const hashedPassword = await hashPassword(password);
            query += ', PasswordHash = @PasswordHash';
            request.input('PasswordHash', db.sql.NVarChar, hashedPassword);
        }

        query += ' WHERE UserID = @UserID';
        await request.query(query);

        await logActivity(req.user.UserID, 'UpdateUser', 'Users', id, { updatedFields: Object.keys(req.body) });
        res.status(200).json({ message: 'User updated successfully.' });

    } catch (error) {
        next(error);
    }
};

// @desc    Get all roles
// @route   GET /api/users/roles
// @access  Private (Admin)
const getRoles = async (req, res, next) => {
    try {
        const pool = await db.getPool();
        const result = await pool.request().query('SELECT RoleID, RoleName FROM Roles ORDER BY RoleName');
        res.status(200).json(result.recordset);
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getUsers,
    updateUser,
    getRoles,
};
