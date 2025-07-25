const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { v4: uuidv4 } = require('uuid'); // For generating UserID if not defaulted by DB

// Generate JWT Token
const generateToken = (id, roleId) => {
  return jwt.sign({ id, roleId }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expiration
  });
};

// @desc    Register a new user (primarily for admin to create users)
// @route   POST /api/auth/register
// @access  Private (Admin only - to be enforced by route protection)
const registerUser = async (req, res, next) => {
  const { username, password, fullName, email, roleId, branchId, isActive = true } = req.body;

  if (!username || !password || !roleId) {
    return res.status(400).json({ message: 'Username, password, and roleId are required.' });
  }

  try {
    const pool = await db.getPool();

    // Check if user already exists
    const userExistsResult = await pool.request()
      .input('Username', db.sql.NVarChar, username)
      .input('Email', db.sql.NVarChar, email) // Also check email if provided
      .query('SELECT UserID FROM Users WHERE Username = @Username OR (Email IS NOT NULL AND Email = @Email)');

    if (userExistsResult.recordset.length > 0) {
      return res.status(400).json({ message: 'User with this username or email already exists.' });
    }

    const hashedPassword = await hashPassword(password);
    const userId = uuidv4(); // Generate UUID for UserID

    const newUserResult = await pool.request()
      .input('UserID', db.sql.UniqueIdentifier, userId)
      .input('Username', db.sql.NVarChar, username)
      .input('PasswordHash', db.sql.NVarChar, hashedPassword)
      .input('FullName', db.sql.NVarChar, fullName)
      .input('Email', db.sql.NVarChar, email)
      .input('RoleID', db.sql.Int, roleId)
      .input('BranchID', db.sql.UniqueIdentifier, branchId) // Can be null
      .input('IsActive', db.sql.Bit, isActive)
      .query(\`
        INSERT INTO Users (UserID, Username, PasswordHash, FullName, Email, RoleID, BranchID, IsActive)
        VALUES (@UserID, @Username, @PasswordHash, @FullName, @Email, @RoleID, @BranchID, @IsActive);
        SELECT UserID, Username, FullName, Email, RoleID, BranchID, IsActive, CreatedAt FROM Users WHERE UserID = @UserID;
      \`);

    const newUser = newUserResult.recordset[0];

    if (newUser) {
      res.status(201).json({
        userID: newUser.UserID,
        username: newUser.Username,
        fullName: newUser.FullName,
        email: newUser.Email,
        roleId: newUser.RoleID,
        branchId: newUser.BranchID,
        isActive: newUser.IsActive,
        createdAt: newUser.CreatedAt,
        // Do not return token on registration by admin; user should login themselves
      });
    } else {
      res.status(400).json({ message: 'Invalid user data or failed to create user.' });
    }
  } catch (error) {
    next(error); // Pass to global error handler
  }
};


// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password.' });
  }

  try {
    const pool = await db.getPool();
    const result = await pool.request()
      .input('Username', db.sql.NVarChar, username)
      .query('SELECT UserID, Username, PasswordHash, RoleID, FullName, Email, IsActive, BranchID FROM Users WHERE Username = @Username');

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials (user not found).' });
    }

    const user = result.recordset[0];

    if (!user.IsActive) {
      return res.status(403).json({ message: 'Account is inactive. Please contact administrator.' });
    }

    const isMatch = await comparePassword(password, user.PasswordHash);

    if (isMatch) {
      // Update LastLogin timestamp
      await pool.request()
        .input('UserID', db.sql.UniqueIdentifier, user.UserID)
        .query('UPDATE Users SET LastLogin = GETDATE() WHERE UserID = @UserID');

      const token = generateToken(user.UserID, user.RoleID);

      // Fetch role name
      const roleResult = await pool.request()
        .input('RoleID', db.sql.Int, user.RoleID)
        .query('SELECT RoleName FROM Roles WHERE RoleID = @RoleID');
      const roleName = roleResult.recordset.length > 0 ? roleResult.recordset[0].RoleName : 'Unknown';

      // Fetch user permissions
      const permissionsResult = await pool.request()
        .input('RoleID', db.sql.Int, user.RoleID)
        .query(\`
          SELECT p.PageKey, a.ActionKey
          FROM Permissions perm
          JOIN Pages p ON perm.PageID = p.PageID
          JOIN Actions a ON perm.ActionID = a.ActionID
          WHERE perm.RoleID = @RoleID AND perm.IsEnabled = 1;
        \`);

      const permissions = {};
      permissionsResult.recordset.forEach(p => {
        if (!permissions[p.PageKey]) {
          permissions[p.PageKey] = [];
        }
        permissions[p.PageKey].push(p.ActionKey);
      });

      res.json({
        userID: user.UserID,
        username: user.Username,
        fullName: user.FullName,
        email: user.Email,
        roleId: user.RoleID,
        roleName: roleName,
        branchId: user.BranchID,
        isActive: user.IsActive,
        token,
        permissions // Send permissions to frontend
      });
    } else {
      return res.status(401).json({ message: 'Invalid credentials (password mismatch).' });
    }
  } catch (error) {
    next(error); // Pass to global error handler
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  // req.user is populated by the 'protect' middleware
  if (!req.user) {
    return res.status(404).json({ message: 'User not found or not authenticated.' });
  }

  // Optionally, re-fetch permissions if they can change frequently and you want the latest
  // For now, assume permissions sent at login are sufficient for the session lifetime
  // or frontend re-fetches/validates as needed.

  try {
    const pool = await db.getPool();
    // Fetch role name
    const roleResult = await pool.request()
      .input('RoleID', db.sql.Int, req.user.RoleID)
      .query('SELECT RoleName FROM Roles WHERE RoleID = @RoleID');
    const roleName = roleResult.recordset.length > 0 ? roleResult.recordset[0].RoleName : 'Unknown';

    // Fetch user permissions (could be useful for client-side updates)
    const permissionsResult = await pool.request()
        .input('RoleID', db.sql.Int, req.user.RoleID)
        .query(\`
            SELECT p.PageKey, a.ActionKey
            FROM Permissions perm
            JOIN Pages p ON perm.PageID = p.PageID
            JOIN Actions a ON perm.ActionID = a.ActionID
            WHERE perm.RoleID = @RoleID AND perm.IsEnabled = 1;
        \`);

    const permissions = {};
    permissionsResult.recordset.forEach(p => {
        if (!permissions[p.PageKey]) {
            permissions[p.PageKey] = [];
        }
        permissions[p.PageKey].push(p.ActionKey);
    });


    res.status(200).json({
      userID: req.user.UserID,
      username: req.user.Username,
      fullName: req.user.FullName,
      email: req.user.Email,
      roleId: req.user.RoleID,
      roleName: roleName, // Add roleName
      branchId: req.user.BranchID, // Add branchId if it exists on req.user
      isActive: req.user.IsActive,
      permissions: permissions, // Send updated permissions
    });

  } catch (error) {
    next(error);
  }
};


// @desc    Controller for creating the first admin user (if no users exist)
// @route   POST /api/auth/setup-admin
// @access  Public (but should only work if no admin user exists)
const setupAdminUser = async (req, res, next) => {
  const { username, password, fullName, email } = req.body;

  if (!username || !password || !fullName || !email) {
    return res.status(400).json({ message: 'Username, password, fullName, and email are required for admin setup.' });
  }
  if (password.length < 6) { // Basic password policy
    return res.status(400).json({ message: 'Password must be at least 6 characters long.'});
  }

  try {
    const pool = await db.getPool();

    // Check if any admin user already exists
    const adminRoleResult = await pool.request()
      .input('RoleName', db.sql.NVarChar, 'Admin')
      .query('SELECT RoleID FROM Roles WHERE RoleName = @RoleName');

    if (adminRoleResult.recordset.length === 0) {
      return res.status(500).json({ message: "'Admin' role not found. Please run database migrations/seeds." });
    }
    const adminRoleId = adminRoleResult.recordset[0].RoleID;

    const adminUserExistsResult = await pool.request()
      .input('RoleID', db.sql.Int, adminRoleId)
      .query('SELECT COUNT(UserID) as AdminCount FROM Users WHERE RoleID = @RoleID');

    if (adminUserExistsResult.recordset[0].AdminCount > 0) {
      return res.status(403).json({ message: 'An admin user already exists. Setup is not allowed.' });
    }

    // Create the admin user
    const hashedPassword = await hashPassword(password);
    const adminUserId = uuidv4();

    await pool.request()
      .input('UserID', db.sql.UniqueIdentifier, adminUserId)
      .input('Username', db.sql.NVarChar, username)
      .input('PasswordHash', db.sql.NVarChar, hashedPassword)
      .input('FullName', db.sql.NVarChar, fullName)
      .input('Email', db.sql.NVarChar, email)
      .input('RoleID', db.sql.Int, adminRoleId)
      .input('IsActive', db.sql.Bit, true)
      .query(\`
        INSERT INTO Users (UserID, Username, PasswordHash, FullName, Email, RoleID, IsActive)
        VALUES (@UserID, @Username, @PasswordHash, @FullName, @Email, @RoleID, @IsActive);
      \`);

    res.status(201).json({
      message: 'Admin user created successfully. Please login.',
      username: username
    });

  } catch (error) {
    if (error.message && error.message.includes("UQ_Users_Username")) {
        return res.status(400).json({ message: `Username '${username}' is already taken.`});
    }
    if (error.message && error.message.includes("UQ_Users_Email")) {
        return res.status(400).json({ message: `Email '${email}' is already registered.`});
    }
    next(error);
  }
};


module.exports = {
  registerUser,
  loginUser,
  getMe,
  setupAdminUser,
  generateToken
};
