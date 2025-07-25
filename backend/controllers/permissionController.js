const db = require('../config/db');
const { logActivity } = require('../utils/logger');

// @desc    Get all permissions grouped by role
// @route   GET /api/permissions
// @access  Private (Admin)
const getPermissions = async (req, res, next) => {
    try {
        const pool = await db.getPool();
        const result = await pool.request().query(`
            SELECT r.RoleID, r.RoleName, p.PageKey, a.ActionKey
            FROM Permissions perm
            JOIN Roles r ON perm.RoleID = r.RoleID
            JOIN Pages p ON perm.PageID = p.PageID
            JOIN Actions a ON perm.ActionID = a.ActionID
            WHERE perm.IsEnabled = 1
        `);

        const permissionsByRole = {};
        result.recordset.forEach(row => {
            if (!permissionsByRole[row.RoleName]) {
                permissionsByRole[row.RoleName] = {};
            }
            if (!permissionsByRole[row.RoleName][row.PageKey]) {
                permissionsByRole[row.RoleName][row.PageKey] = [];
            }
            permissionsByRole[row.RoleName][row.PageKey].push(row.ActionKey);
        });

        res.status(200).json(permissionsByRole);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all pages and actions for building the permissions UI
// @route   GET /api/permissions/matrix
// @access  Private (Admin)
const getPermissionMatrix = async (req, res, next) => {
    try {
        const pool = await db.getPool();
        const pagesResult = await pool.request().query('SELECT PageID, PageKey, PageName, Module FROM Pages ORDER BY Module, PageName');
        const actionsResult = await pool.request().query('SELECT ActionID, ActionKey, ActionName FROM Actions ORDER BY ActionName');

        res.status(200).json({
            pages: pagesResult.recordset,
            actions: actionsResult.recordset,
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Update permissions for a role
// @route   POST /api/permissions/:roleId
// @access  Private (Admin)
const updatePermissions = async (req, res, next) => {
    const { roleId } = req.params;
    const { permissions } = req.body; // Expects format: { pageKey: { actionKey: boolean, ... }, ... }

    const pool = await db.getPool();
    const transaction = new db.sql.Transaction(pool);

    try {
        await transaction.begin();

        // Clear existing permissions for this role
        await new db.sql.Request(transaction)
            .input('RoleID', db.sql.Int, roleId)
            .query('DELETE FROM Permissions WHERE RoleID = @RoleID');

        // Insert new permissions
        for (const pageKey in permissions) {
            for (const actionKey in permissions[pageKey]) {
                if (permissions[pageKey][actionKey]) { // if the value is true
                    await new db.sql.Request(transaction)
                        .input('RoleID', db.sql.Int, roleId)
                        .input('PageKey', db.sql.NVarChar, pageKey)
                        .input('ActionKey', db.sql.NVarChar, actionKey)
                        .query(`
                            INSERT INTO Permissions (RoleID, PageID, ActionID)
                            SELECT @RoleID, p.PageID, a.ActionID
                            FROM Pages p, Actions a
                            WHERE p.PageKey = @PageKey AND a.ActionKey = @ActionKey
                        `);
                }
            }
        }

        await transaction.commit();
        await logActivity(req.user.UserID, 'UpdatePermissions', 'Roles', roleId, { permissions });
        res.status(200).json({ message: 'Permissions updated successfully.' });

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};


module.exports = {
    getPermissions,
    getPermissionMatrix,
    updatePermissions,
};
