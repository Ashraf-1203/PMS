const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { convertRmToSqm } = require('../utils/calculationUtils');

// @desc    Initiate a paper transfer
// @route   POST /api/transfers/initiate
// @access  Private
const initiateTransfer = async (req, res, next) => {
    const { sourceBranchId, destinationBranchId, paperId, quantityRm, remarks } = req.body;
    const sentByUserId = req.user.UserID;

    if (!sourceBranchId || !destinationBranchId || !paperId || !quantityRm || parseFloat(quantityRm) <= 0) {
        return res.status(400).json({ message: 'Source, Destination, Paper, and a positive Quantity are required.' });
    }
    if (sourceBranchId === destinationBranchId) {
        return res.status(400).json({ message: 'Source and Destination branches cannot be the same.' });
    }

    const pool = await db.getPool();
    const transaction = new db.sql.Transaction(pool);

    try {
        await transaction.begin();

        // Check for sufficient stock at source branch
        const paperCheck = await new db.sql.Request(transaction)
            .input('PaperID', db.sql.UniqueIdentifier, paperId)
            .query('SELECT StockRM FROM Papers WHERE PaperID = @PaperID');

        if (paperCheck.recordset.length === 0 || paperCheck.recordset[0].StockRM < parseFloat(quantityRm)) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Insufficient stock at the source branch for this transfer.' });
        }

        // Create the transfer record
        const transferId = uuidv4();
        await new db.sql.Request(transaction)
            .input('TransferID', db.sql.UniqueIdentifier, transferId)
            .input('SourceBranchID', db.sql.UniqueIdentifier, sourceBranchId)
            .input('DestinationBranchID', db.sql.UniqueIdentifier, destinationBranchId)
            .input('PaperID', db.sql.UniqueIdentifier, paperId)
            .input('QuantityRM', db.sql.Decimal(18, 2), quantityRm)
            .input('SentBy', db.sql.UniqueIdentifier, sentByUserId)
            .input('Remarks', db.sql.NVarChar, remarks)
            .query(`
                INSERT INTO Transfers (TransferID, SourceBranchID, DestinationBranchID, PaperID, QuantityRM, SentBy, Remarks)
                VALUES (@TransferID, @SourceBranchID, @DestinationBranchID, @PaperID, @QuantityRM, @SentBy, @Remarks)
            `);

        // Create a notification for managers/admins of the destination branch
        // For simplicity, notifying all admins for now. A better impl would find branch managers.
        const adminsResult = await new db.sql.Request(transaction)
            .query("SELECT u.UserID FROM Users u JOIN Roles r ON u.RoleID = r.RoleID WHERE r.RoleName = 'Admin' OR r.RoleName = 'Manager'");

        const link = \`/transfers/approve/${transferId}\`;
        const message = `New paper transfer request for ${quantityRm} RM requires your approval.`;

        for (const admin of adminsResult.recordset) {
            await new db.sql.Request(transaction)
                .input('UserID', db.sql.UniqueIdentifier, admin.UserID)
                .input('Message', db.sql.NVarChar, message)
                .input('Link', db.sql.NVarChar, link)
                .query('INSERT INTO Notifications (UserID, Message, Link) VALUES (@UserID, @Message, @Link)');
        }

        await transaction.commit();
        res.status(201).json({ message: 'Transfer initiated successfully. Awaiting approval.' });

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

// @desc    Approve a paper transfer
// @route   POST /api/transfers/:id/approve
// @access  Private
const approveTransfer = async (req, res, next) => {
    const { id: transferId } = req.params;
    const approvedByUserId = req.user.UserID;

    const pool = await db.getPool();
    const transaction = new db.sql.Transaction(pool);

    try {
        await transaction.begin();
        const request = new db.sql.Request(transaction);

        // 1. Get transfer details and lock the row
        const transferResult = await request
            .input('TransferID', db.sql.UniqueIdentifier, transferId)
            .query('SELECT * FROM Transfers WHERE TransferID = @TransferID AND Status = \'Pending\' FOR UPDATE');

        if (transferResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Pending transfer not found or already actioned.' });
        }
        const transfer = transferResult.recordset[0];
        const { SourceBranchID, DestinationBranchID, PaperID, QuantityRM } = transfer;

        // 2. Get source paper and check stock again
        const sourcePaperResult = await new db.sql.Request(transaction)
            .input('PaperID', db.sql.UniqueIdentifier, PaperID)
            .query('SELECT * FROM Papers WHERE PaperID = @PaperID FOR UPDATE');

        const sourcePaper = sourcePaperResult.recordset[0];
        if (sourcePaper.StockRM < QuantityRM) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Insufficient stock at source. Transfer cannot be completed.' });
        }

        // 3. Deduct stock from source
        const qRm = parseFloat(QuantityRM);
        const qSqmSource = convertRmToSqm(qRm, parseFloat(sourcePaper.Width));
        await new db.sql.Request(transaction).input('ID', PaperID).input('RM', -qRm).input('SQM', -qSqmSource).query('UPDATE Papers SET StockRM = StockRM - @RM, StockSQM = StockSQM - @SQM WHERE PaperID = @ID');

        // 4. Find or create paper at destination
        const destPaperResult = await new db.sql.Request(transaction)
            .input('Manufacturer', sourcePaper.Manufacturer)
            .input('Grade', sourcePaper.Grade)
            .input('Width', sourcePaper.Width)
            .input('BranchID', DestinationBranchID)
            .query('SELECT * FROM Papers WHERE Manufacturer = @Manufacturer AND Grade = @Grade AND Width = @Width AND BranchID = @BranchID');

        let destPaper;
        if (destPaperResult.recordset.length > 0) {
            destPaper = destPaperResult.recordset[0];
        } else {
            const newPaperId = uuidv4();
            const newPaperRes = await new db.sql.Request(transaction)
                .input('PaperID', newPaperId).input('Man', sourcePaper.Manufacturer).input('Grade', sourcePaper.Grade)
                .input('Width', sourcePaper.Width).input('GSM', sourcePaper.GSM).input('Rate', sourcePaper.Rate)
                .input('BranchID', DestinationBranchID)
                .query(`INSERT INTO Papers (PaperID, Manufacturer, Grade, Width, GSM, Rate, BranchID) VALUES (@PaperID, @Man, @Grade, @Width, @GSM, @Rate, @BranchID); SELECT * FROM Papers WHERE PaperID = @PaperID;`);
            destPaper = newPaperRes.recordset[0];
        }

        // 5. Add stock to destination paper
        const qSqmDest = convertRmToSqm(qRm, parseFloat(destPaper.Width));
        await new db.sql.Request(transaction).input('ID', destPaper.PaperID).input('RM', qRm).input('SQM', qSqmDest).query('UPDATE Papers SET StockRM = StockRM + @RM, StockSQM = StockSQM + @SQM WHERE PaperID = @ID');

        // 6. Log transactions
        await new db.sql.Request(transaction).input('P_ID', sourcePaper.PaperID).input('B_ID', SourceBranchID).input('Type', 'Transfer-Out').input('RM', -qRm).input('SQM', -qSqmSource).input('By', approvedByUserId).query(`INSERT INTO InventoryTransactions (PaperID, BranchID, TransactionType, QuantityRM, QuantitySQM, CreatedBy) VALUES (@P_ID, @B_ID, @Type, @RM, @SQM, @By)`);
        await new db.sql.Request(transaction).input('P_ID', destPaper.PaperID).input('B_ID', DestinationBranchID).input('Type', 'Transfer-In').input('RM', qRm).input('SQM', qSqmDest).input('By', approvedByUserId).query(`INSERT INTO InventoryTransactions (PaperID, BranchID, TransactionType, QuantityRM, QuantitySQM, CreatedBy) VALUES (@P_ID, @B_ID, @Type, @RM, @SQM, @By)`);

        // 7. Update transfer status
        await new db.sql.Request(transaction).input('ID', transferId).input('By', approvedByUserId).query("UPDATE Transfers SET Status = 'Approved', ApprovedBy = @By, ActionAt = GETDATE() WHERE TransferID = @ID");

        await transaction.commit();
        res.status(200).json({ message: 'Transfer approved and completed successfully.' });

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

// @desc    Get pending transfers for the current user (if admin/manager)
// @route   GET /api/transfers/pending
// @access  Private
const getPendingTransfers = async (req, res, next) => {
    try {
        const pool = await db.getPool();
        const result = await pool.request().query(`
            SELECT t.*, p.Manufacturer, p.Grade, p.Width, sb.BranchName as SourceBranchName, db.BranchName as DestBranchName, u.Username as SentByUsername
            FROM Transfers t
            JOIN Papers p ON t.PaperID = p.PaperID
            JOIN Branches sb ON t.SourceBranchID = sb.BranchID
            JOIN Branches db ON t.DestinationBranchID = db.BranchID
            JOIN Users u ON t.SentBy = u.UserID
            WHERE t.Status = 'Pending'
            ORDER BY t.SentAt DESC
        `);
        // In a real app, you might filter this to only show transfers to the current user's branch.
        res.status(200).json(result.recordset);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    initiateTransfer,
    approveTransfer,
    getPendingTransfers,
};
