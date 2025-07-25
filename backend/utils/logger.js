const db = require('../config/db');

/**
 * Logs an activity to the ActivityLog table.
 * @param {string} userId - The ID of the user performing the action.
 * @param {string} actionType - The type of action (e.g., 'CreateUser', 'UpdatePermission').
 * @param {string} [targetEntity] - The entity being affected (e.g., 'Users').
 * @param {string} [targetId] - The ID of the entity being affected.
 * @param {object} [details] - An object containing details of the action (e.g., { oldValue: 'A', newValue: 'B' }).
 */
const logActivity = async (userId, actionType, targetEntity = null, targetId = null, details = null) => {
    try {
        const pool = await db.getPool();
        const request = pool.request()
            .input('UserID', db.sql.UniqueIdentifier, userId)
            .input('ActionType', db.sql.NVarChar, actionType)
            .input('TargetEntity', db.sql.NVarChar, targetEntity)
            .input('TargetID', db.sql.NVarChar, targetId)
            .input('Details', db.sql.NVarChar, details ? JSON.stringify(details) : null);

        await request.query(`
            INSERT INTO ActivityLog (UserID, ActionType, TargetEntity, TargetID, Details)
            VALUES (@UserID, @ActionType, @TargetEntity, @TargetID, @Details)
        `);
    } catch (error) {
        // Log the error to the console, but don't let it crash the application
        console.error('Failed to log activity:', error);
    }
};

module.exports = { logActivity };
