const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { logActivity } = require('../utils/logger');

// @desc    Get all machines for the user's branch or all branches for Admin
// @route   GET /api/machines
// @access  Private (Requires 'view' on 'machineEntry')
const getMachines = async (req, res, next) => {
    try {
        const pool = await db.getPool();
        // For now, fetching all machines. Branch filtering can be added.
        const result = await pool.request().query(\`
            SELECT m.MachineID, m.Name, m.IsActive, m.BranchID, b.BranchName
            FROM Machines m
            JOIN Branches b ON m.BranchID = b.BranchID
            WHERE m.IsActive = 1
            ORDER BY b.BranchName, m.Name
        \`);
        res.status(200).json(result.recordset);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new machine
// @route   POST /api/machines
// @access  Private (Requires 'add' on 'machineEntry')
const createMachine = async (req, res, next) => {
    const { name, branchId } = req.body;

    if (!name || !branchId) {
        return res.status(400).json({ message: 'Machine name and branch are required.' });
    }

    try {
        const pool = await db.getPool();
        const machineId = uuidv4();

        const result = await pool.request()
            .input('MachineID', db.sql.UniqueIdentifier, machineId)
            .input('Name', db.sql.NVarChar, name)
            .input('BranchID', db.sql.UniqueIdentifier, branchId)
            .query(\`
                INSERT INTO Machines (MachineID, Name, BranchID)
                VALUES (@MachineID, @Name, @BranchID);
                SELECT m.MachineID, m.Name, m.IsActive, m.BranchID, b.BranchName
                FROM Machines m
                JOIN Branches b ON m.BranchID = b.BranchID
                WHERE m.MachineID = @MachineID;
            \`);

        const newMachine = result.recordset[0];
        await logActivity(req.user.UserID, 'CreateMachine', 'Machines', newMachine.MachineID, { name: newMachine.Name, branchId: newMachine.BranchID });
        res.status(201).json(newMachine);
    } catch (error) {
        if (error.message.includes('UQ_Machine_Name_Per_Branch')) {
            return res.status(409).json({ message: \`A machine with the name '${name}' already exists in this branch.\` });
        }
        next(error);
    }
};

// @desc    Update a machine
// @route   PUT /api/machines/:id
// @access  Private (Requires 'edit' on 'machineEntry')
const updateMachine = async (req, res, next) => {
    const { id } = req.params;
    const { name, branchId } = req.body;

    if (!name || !branchId) {
        return res.status(400).json({ message: 'Machine name and branch are required.' });
    }

    try {
        const pool = await db.getPool();
        const result = await pool.request()
            .input('MachineID', db.sql.UniqueIdentifier, id)
            .input('Name', db.sql.NVarChar, name)
            .input('BranchID', db.sql.UniqueIdentifier, branchId)
            .query(\`
                UPDATE Machines
                SET Name = @Name, BranchID = @BranchID, UpdatedAt = GETDATE()
                WHERE MachineID = @MachineID;

                SELECT m.MachineID, m.Name, m.IsActive, m.BranchID, b.BranchName
                FROM Machines m
                JOIN Branches b ON m.BranchID = b.BranchID
                WHERE m.MachineID = @MachineID;
            \`);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Machine not found.' });
        }
        res.status(200).json(result.recordset[0]);
    } catch (error) {
        if (error.message.includes('UQ_Machine_Name_Per_Branch')) {
            return res.status(409).json({ message: \`A machine with the name '${name}' already exists in this branch.\` });
        }
        next(error);
    }
};

// @desc    Delete a machine (soft delete)
// @route   DELETE /api/machines/:id
// @access  Private (Requires 'delete' on 'machineEntry')
const deleteMachine = async (req, res, next) => {
    const { id } = req.params;
    try {
        const pool = await db.getPool();
        const result = await pool.request()
            .input('MachineID', db.sql.UniqueIdentifier, id)
            .query('UPDATE Machines SET IsActive = 0, UpdatedAt = GETDATE() WHERE MachineID = @MachineID AND IsActive = 1');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Machine not found or already inactive.' });
        }
        await logActivity(req.user.UserID, 'DeleteMachine', 'Machines', id);
        res.status(200).json({ message: 'Machine deactivated successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMachines,
    createMachine,
    updateMachine,
    deleteMachine,
};
