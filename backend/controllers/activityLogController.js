const db = require('../config/db');

// @desc    Get all activities (from both logs) with pagination
// @route   GET /api/activity-log
// @access  Private (Requires 'view' on 'activityLog')
const getAllActivities = async (req, res, next) => {
    // Basic pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30;
    const offset = (page - 1) * limit;

    try {
        const pool = await db.getPool();
        const result = await pool.request()
            .input('Offset', db.sql.Int, offset)
            .input('Limit', db.sql.Int, limit)
            .query(`
                SELECT * FROM (
                    -- Inventory Transactions
                    SELECT
                        it.TransactionID AS id,
                        u.Username,
                        it.TransactionType AS action,
                        'Inventory' AS entity,
                        p.Manufacturer + ' ' + p.Grade + ' ' + CAST(p.Width AS NVARCHAR) + 'mm' AS target,
                        it.QuantityRM AS details,
                        it.CreatedAt
                    FROM InventoryTransactions it
                    JOIN Users u ON it.CreatedBy = u.UserID
                    JOIN Papers p ON it.PaperID = p.PaperID

                    UNION ALL

                    -- General Activity Log
                    SELECT
                        al.LogID AS id,
                        u.Username,
                        al.ActionType AS action,
                        al.TargetEntity AS entity,
                        al.TargetID AS target,
                        al.Details AS details,
                        al.CreatedAt
                    FROM ActivityLog al
                    JOIN Users u ON al.UserID = u.UserID
                ) AS CombinedLog
                ORDER BY CreatedAt DESC
                OFFSET @Offset ROWS
                FETCH NEXT @Limit ROWS ONLY;
            `);

        // Also get total count for pagination
        const totalResult = await pool.request().query('SELECT (SELECT COUNT(*) FROM InventoryTransactions) + (SELECT COUNT(*) FROM ActivityLog) as total');
        const total = totalResult.recordset[0].total;

        res.status(200).json({
            activities: result.recordset,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });

    } catch (error) {
        next(error);
    }
};

const getHistoryForTarget = async (req, res, next) => {
    const { targetEntity, targetId } = req.params;

    if (!targetEntity || !targetId) {
        return res.status(400).json({ message: 'Target entity and ID are required.' });
    }

    try {
        const pool = await db.getPool();
        const result = await pool.request()
            .input('TargetID', db.sql.NVarChar, targetId)
            .query(`
                SELECT
                    it.TransactionID AS id,
                    u.Username,
                    it.TransactionType AS action,
                    'Inventory' AS entity,
                    it.QuantityRM,
                    it.QuantitySQM,
                    it.QuantityKG,
                    it.Remarks,
                    it.CreatedAt
                FROM InventoryTransactions it
                JOIN Users u ON it.CreatedBy = u.UserID
                WHERE it.PaperID = @TargetID -- Assuming for now history is only for papers

                UNION ALL

                SELECT
                    al.LogID AS id,
                    u.Username,
                    al.ActionType AS action,
                    al.TargetEntity AS entity,
                    NULL as QuantityRM,
                    NULL as QuantitySQM,
                    NULL as QuantityKG,
                    al.Details AS Remarks,
                    al.CreatedAt
                FROM ActivityLog al
                JOIN Users u ON al.UserID = u.UserID
                WHERE al.TargetEntity = @targetEntity AND al.TargetID = @TargetID
                ORDER BY CreatedAt DESC;
            `);

        res.status(200).json(result.recordset);

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllActivities,
    getHistoryForTarget,
};
