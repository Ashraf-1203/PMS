const db = require('../config/db');

// @desc    Get Stock Report
// @route   GET /api/reports/stock
// @access  Private
const getStockReport = async (req, res, next) => {
    const { branchId, manufacturer, grade } = req.query;

    try {
        let query = \`
            SELECT
                p.Manufacturer, p.Grade, p.Width, p.GSM,
                p.StockRM, p.StockSQM, p.Rate,
                (p.StockSQM * p.Rate) as Amount,
                b.BranchName
            FROM Papers p
            JOIN Branches b ON p.BranchID = b.BranchID
            WHERE p.IsActive = 1
        \`;

        const request = new db.sql.Request();

        if (branchId) {
            query += ' AND p.BranchID = @BranchID';
            request.input('BranchID', db.sql.UniqueIdentifier, branchId);
        }
        if (manufacturer) {
            query += ' AND p.Manufacturer LIKE @Manufacturer';
            request.input('Manufacturer', db.sql.NVarChar, \`%${manufacturer}%\`);
        }
        if (grade) {
            query += ' AND p.Grade LIKE @Grade';
            request.input('Grade', db.sql.NVarChar, \`%${grade}%\`);
        }

        query += ' ORDER BY b.BranchName, p.Manufacturer, p.Grade, p.Width;';

        const result = await request.query(query);
        res.status(200).json(result.recordset);

    } catch (error) {
        next(error);
    }
};

const getTransactionReport = async (req, res, next) => {
    const { transactionType } = req.params;
    const { branchId, dateFrom, dateTo } = req.query;

    const validTransactionTypes = ['Issued', 'Returned', 'Transfer', 'Rejected', 'Consumed', 'Receive'];
    if (!validTransactionTypes.includes(transactionType)) {
        return res.status(400).json({ message: 'Invalid report type specified.' });
    }

    try {
        let query = \`
            SELECT
                it.*,
                p.Manufacturer, p.Grade, p.Width,
                u.Username AS PerformedBy,
                b.BranchName
            FROM InventoryTransactions it
            JOIN Users u ON it.CreatedBy = u.UserID
            JOIN Papers p ON it.PaperID = p.PaperID
            JOIN Branches b ON it.BranchID = b.BranchID
            WHERE it.TransactionType = @TransactionType
        \`;

        const request = new db.sql.Request();
        request.input('TransactionType', db.sql.NVarChar, transactionType);

        if (branchId) {
            query += ' AND it.BranchID = @BranchID';
            request.input('BranchID', db.sql.UniqueIdentifier, branchId);
        }
        if (dateFrom) {
            query += ' AND it.CreatedAt >= @DateFrom';
            request.input('DateFrom', db.sql.Date, dateFrom);
        }
        if (dateTo) {
            query += ' AND it.CreatedAt <= @DateTo';
            request.input('DateTo', db.sql.Date, dateTo);
        }

        query += ' ORDER BY it.CreatedAt DESC;';

        const result = await request.query(query);
        res.status(200).json(result.recordset);

    } catch (error) {
        next(error);
    }
};


module.exports = {
    getStockReport,
    getTransactionReport,
};
