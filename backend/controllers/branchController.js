const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// @desc    Get all active branches
// @route   GET /api/branches
// @access  Private (any logged-in user can get this list for dropdowns)
const getBranches = async (req, res, next) => {
    try {
        const pool = await db.getPool();
        const result = await pool.request()
            .query('SELECT BranchID, BranchName, Location, IsActive FROM Branches ORDER BY BranchName');
        res.status(200).json(result.recordset);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new branch
// @route   POST /api/branches
// @access  Private (Requires 'add' on 'branchList')
const createBranch = async (req, res, next) => {
    const { branchName, location } = req.body;
    if (!branchName) {
        return res.status(400).json({ message: 'Branch name is required.' });
    }
    try {
        const pool = await db.getPool();
        const branchId = uuidv4();
        const result = await pool.request()
            .input('BranchID', db.sql.UniqueIdentifier, branchId)
            .input('BranchName', db.sql.NVarChar, branchName)
            .input('Location', db.sql.NVarChar, location)
            .query(`
                INSERT INTO Branches (BranchID, BranchName, Location) VALUES (@BranchID, @BranchName, @Location);
                SELECT BranchID, BranchName, Location, IsActive FROM Branches WHERE BranchID = @BranchID;
            `);
        res.status(201).json(result.recordset[0]);
    } catch (error) {
        if (error.message.includes('UQ_Branches_BranchName')) {
            return res.status(409).json({ message: 'A branch with this name already exists.' });
        }
        next(error);
    }
};

// @desc    Update a branch
// @route   PUT /api/branches/:id
// @access  Private (Requires 'edit' on 'branchList')
const updateBranch = async (req, res, next) => {
    const { id } = req.params;
    const { branchName, location, isActive } = req.body;
    if (!branchName) {
        return res.status(400).json({ message: 'Branch name is required.' });
    }
    try {
        const pool = await db.getPool();
        const result = await pool.request()
            .input('BranchID', db.sql.UniqueIdentifier, id)
            .input('BranchName', db.sql.NVarChar, branchName)
            .input('Location', db.sql.NVarChar, location)
            .input('IsActive', db.sql.Bit, isActive)
            .query(`
                UPDATE Branches SET BranchName = @BranchName, Location = @Location, IsActive = @IsActive, UpdatedAt = GETDATE()
                WHERE BranchID = @BranchID;
                SELECT BranchID, BranchName, Location, IsActive FROM Branches WHERE BranchID = @BranchID;
            `);
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Branch not found.' });
        }
        res.status(200).json(result.recordset[0]);
    } catch (error) {
        if (error.message.includes('UQ_Branches_BranchName')) {
            return res.status(409).json({ message: 'A branch with this name already exists.' });
        }
        next(error);
    }
};

// @desc    Delete a branch (soft delete)
// @route   DELETE /api/branches/:id
// @access  Private (Requires 'delete' on 'branchList')
const deleteBranch = async (req, res, next) => {
    const { id } = req.params;
    try {
        const pool = await db.getPool();

        // Prevent deletion if branch is in use by papers or machines or users
        const papersCheck = await pool.request().input('BranchID', db.sql.UniqueIdentifier, id).query('SELECT TOP 1 1 FROM Papers WHERE BranchID = @BranchID');
        if (papersCheck.recordset.length > 0) return res.status(400).json({ message: 'Cannot deactivate branch. It is currently in use by paper stock records.' });

        const machinesCheck = await pool.request().input('BranchID', db.sql.UniqueIdentifier, id).query('SELECT TOP 1 1 FROM Machines WHERE BranchID = @BranchID');
        if (machinesCheck.recordset.length > 0) return res.status(400).json({ message: 'Cannot deactivate branch. It is currently in use by machines.' });

        const usersCheck = await pool.request().input('BranchID', db.sql.UniqueIdentifier, id).query('SELECT TOP 1 1 FROM Users WHERE BranchID = @BranchID');
        if (usersCheck.recordset.length > 0) return res.status(400).json({ message: 'Cannot deactivate branch. It is currently assigned to users.' });

        const result = await pool.request()
            .input('BranchID', db.sql.UniqueIdentifier, id)
            .query('UPDATE Branches SET IsActive = 0, UpdatedAt = GETDATE() WHERE BranchID = @BranchID AND IsActive = 1');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Branch not found or already inactive.' });
        }
        res.status(200).json({ message: 'Branch deactivated successfully' });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getBranches,
    createBranch,
    updateBranch,
    deleteBranch,
};
