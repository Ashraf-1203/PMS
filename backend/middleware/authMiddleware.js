const jwt = require('jsonwebtoken');
const db = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const pool = await db.getPool();
      const result = await pool.request()
        .input('UserID', db.sql.UniqueIdentifier, decoded.id)
        .query('SELECT UserID, Username, RoleID, FullName, Email, IsActive FROM Users WHERE UserID = @UserID');

      if (result.recordset.length === 0) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      req.user = result.recordset[0];

      if (!req.user.IsActive) {
        res.status(403); // Forbidden
        throw new Error('User account is inactive.');
      }

      next();
    } catch (error) {
      console.error('Token verification failed or user not found/inactive:', error);
      res.status(401).json({ message: 'Not authorized, token failed or user issue.' }); // Keep it generic for security
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to check for specific roles or permissions
// This is a basic role check. More granular permission checks will be more complex.
const authorize = (roles = []) => {
  // roles param can be a single role string (e.g., 'Admin')
  // or an array of roles (e.g., ['Admin', 'Manager'])
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return async (req, res, next) => {
    if (!req.user || !req.user.RoleID) {
      return res.status(403).json({ message: 'User role not found. Forbidden.' });
    }

    const pool = await db.getPool();
    const roleResult = await pool.request()
      .input('RoleID', db.sql.Int, req.user.RoleID)
      .query('SELECT RoleName FROM Roles WHERE RoleID = @RoleID');

    if (roleResult.recordset.length === 0) {
      return res.status(403).json({ message: 'User role invalid. Forbidden.' });
    }

    const userRoleName = roleResult.recordset[0].RoleName;

    if (roles.length && !roles.includes(userRoleName)) {
      // User's role is not in the allowed roles list
      return res.status(403).json({
        message: \`User role '${userRoleName}' is not authorized to access this resource. Required roles: ${roles.join(', ')}.\`
      });
    }

    // User has one of the required roles
    next();
  };
};


// More granular permission check middleware
const checkPermission = (pageKey, actionKey) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.RoleID) {
      return res.status(403).json({ message: 'Forbidden: User role not identified.' });
    }

    try {
      const pool = await db.getPool();
      const permissionResult = await pool.request()
        .input('RoleID', db.sql.Int, req.user.RoleID)
        .input('PageKey', db.sql.NVarChar, pageKey)
        .input('ActionKey', db.sql.NVarChar, actionKey)
        .query(\`
          SELECT COUNT(perm.PermissionID) AS HasPermission
          FROM Permissions perm
          JOIN Pages p ON perm.PageID = p.PageID
          JOIN Actions a ON perm.ActionID = a.ActionID
          WHERE perm.RoleID = @RoleID
            AND p.PageKey = @PageKey
            AND a.ActionKey = @ActionKey
            AND perm.IsEnabled = 1;
        \`);

      if (permissionResult.recordset[0].HasPermission > 0) {
        next(); // User has the permission
      } else {
        res.status(403).json({
          message: \`Forbidden: You do not have '${actionKey}' permission for the page '${pageKey}'.\`
        });
      }
    } catch (error) {
      console.error('Error checking permission:', error);
      res.status(500).json({ message: 'Error checking permissions.' });
    }
  };
};


module.exports = { protect, authorize, checkPermission };
