const db = require('../config/db');
const { convertRmToSqm, convertKgToRm, applyReturnedKgDeductions } = require('../utils/calculationUtils');

// @desc    Receive paper stock
// @route   POST /api/inventory/receive
// @access  Private (Requires 'add' on 'receivePaper')
const receivePaper = async (req, res, next) => {
    const { paperId, quantityRm, remarks } = req.body;
    const userId = req.user.UserID;

    if (!paperId || !quantityRm || parseFloat(quantityRm) <= 0) {
        return res.status(400).json({ message: 'Paper ID and a positive Quantity (RM) are required.' });
    }

    const pool = await db.getPool();
    const transaction = new db.sql.Transaction(pool);

    try {
        await transaction.begin();

        // 1. Get paper details
        const paperResult = await new db.sql.Request(transaction)
            .input('PaperID', db.sql.UniqueIdentifier, paperId)
            .query('SELECT PaperID, BranchID, Width, StockRM, StockSQM FROM Papers WHERE PaperID = @PaperID');

        if (paperResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Paper not found.' });
        }
        const paper = paperResult.recordset[0];
        const qRm = parseFloat(quantityRm);
        const qSqm = convertRmToSqm(qRm, parseFloat(paper.Width));

        // 2. Update stock on Papers table
        await new db.sql.Request(transaction)
            .input('PaperID', db.sql.UniqueIdentifier, paperId)
            .input('QuantityRM', db.sql.Decimal(18, 2), qRm)
            .input('QuantitySQM', db.sql.Decimal(18, 2), qSqm)
            .query('UPDATE Papers SET StockRM = StockRM + @QuantityRM, StockSQM = StockSQM + @QuantitySQM, UpdatedAt = GETDATE() WHERE PaperID = @PaperID');

        // 3. Log the transaction
        await new db.sql.Request(transaction)
            .input('PaperID', db.sql.UniqueIdentifier, paperId)
            .input('BranchID', db.sql.UniqueIdentifier, paper.BranchID)
            .input('TransactionType', db.sql.NVarChar, 'Receive')
            .input('QuantityRM', db.sql.Decimal(18, 2), qRm)
            .input('QuantitySQM', db.sql.Decimal(18, 2), qSqm)
            .input('Remarks', db.sql.NVarChar, remarks)
            .input('CreatedBy', db.sql.UniqueIdentifier, userId)
            .query(`
                INSERT INTO InventoryTransactions (PaperID, BranchID, TransactionType, QuantityRM, QuantitySQM, Remarks, CreatedBy)
                VALUES (@PaperID, @BranchID, @TransactionType, @QuantityRM, @QuantitySQM, @Remarks, @CreatedBy)
            `);

        await transaction.commit();
        res.status(200).json({ message: 'Paper received successfully.' });

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};


// @desc    Consume paper stock
// @route   POST /api/inventory/consume
// @access  Private (Requires 'add' on 'consumePaper')
const consumePaper = async (req, res, next) => {
    const { paperId, machineId, jpcNumber, quantityRm, remarks } = req.body;
    const userId = req.user.UserID;

    if (!paperId || !machineId || !jpcNumber || !quantityRm || parseFloat(quantityRm) <= 0) {
        return res.status(400).json({ message: 'Paper, Machine, JPC Number, and a positive Quantity (RM) are required.' });
    }

    const pool = await db.getPool();
    const transaction = new db.sql.Transaction(pool);

    try {
        await transaction.begin();

        // 1. Get paper details and check for sufficient stock
        const paperResult = await new db.sql.Request(transaction)
            .input('PaperID', db.sql.UniqueIdentifier, paperId)
            .query('SELECT PaperID, BranchID, Width, StockRM, StockSQM FROM Papers WHERE PaperID = @PaperID FOR UPDATE'); // Lock the row

        if (paperResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Paper not found.' });
        }
        const paper = paperResult.recordset[0];
        const qRm = parseFloat(quantityRm);

        if (paper.StockRM < qRm) {
            await transaction.rollback();
            return res.status(400).json({ message: `Insufficient stock. Available: ${paper.StockRM} RM, Required: ${qRm} RM.` });
        }

        const qSqm = convertRmToSqm(qRm, parseFloat(paper.Width));
        const negativeQRm = -qRm;
        const negativeQSqm = -qSqm;

        // 2. Update stock on Papers table
        await new db.sql.Request(transaction)
            .input('PaperID', db.sql.UniqueIdentifier, paperId)
            .input('QuantityRM', db.sql.Decimal(18, 2), negativeQRm)
            .input('QuantitySQM', db.sql.Decimal(18, 2), negativeQSqm)
            .query('UPDATE Papers SET StockRM = StockRM + @QuantityRM, StockSQM = StockSQM + @QuantitySQM, UpdatedAt = GETDATE() WHERE PaperID = @PaperID');

        // 3. Log the transaction
        await new db.sql.Request(transaction)
            .input('PaperID', db.sql.UniqueIdentifier, paperId)
            .input('BranchID', db.sql.UniqueIdentifier, paper.BranchID)
            .input('TransactionType', db.sql.NVarChar, 'Consume')
            .input('QuantityRM', db.sql.Decimal(18, 2), negativeQRm)
            .input('QuantitySQM', db.sql.Decimal(18, 2), negativeQSqm)
            .input('MachineID', db.sql.UniqueIdentifier, machineId)
            .input('JPCNumber', db.sql.NVarChar, jpcNumber)
            .input('Remarks', db.sql.NVarChar, remarks)
            .input('CreatedBy', db.sql.UniqueIdentifier, userId)
            .query(`
                INSERT INTO InventoryTransactions (PaperID, BranchID, TransactionType, QuantityRM, QuantitySQM, MachineID, JPCNumber, Remarks, CreatedBy)
                VALUES (@PaperID, @BranchID, @TransactionType, @QuantityRM, @QuantitySQM, @MachineID, @JPCNumber, @Remarks, @CreatedBy)
            `);

        await transaction.commit();
        res.status(200).json({ message: 'Paper consumed successfully.' });

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

// @desc    Issue paper stock
// @route   POST /api/inventory/issue
// @access  Private (Requires 'add' on 'issuedPaperList')
const issuePaper = async (req, res, next) => {
    const { paperId, machineId, jpcNumber, quantityRm, remarks } = req.body;
    const userId = req.user.UserID;

    if (!paperId || !machineId || !jpcNumber || !quantityRm || parseFloat(quantityRm) <= 0) {
        return res.status(400).json({ message: 'Paper, Machine, JPC Number, and a positive Quantity (RM) are required.' });
    }

    const pool = await db.getPool();
    const transaction = new db.sql.Transaction(pool);

    try {
        await transaction.begin();

        const paperResult = await new db.sql.Request(transaction)
            .input('PaperID', db.sql.UniqueIdentifier, paperId)
            .query('SELECT PaperID, BranchID, Width, StockRM FROM Papers WHERE PaperID = @PaperID FOR UPDATE');

        if (paperResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Paper not found.' });
        }
        const paper = paperResult.recordset[0];
        const qRm = parseFloat(quantityRm);

        if (paper.StockRM < qRm) {
            await transaction.rollback();
            return res.status(400).json({ message: `Insufficient stock. Available: ${paper.StockRM} RM, Required: ${qRm} RM.` });
        }

        const qSqm = convertRmToSqm(qRm, parseFloat(paper.Width));
        const negativeQRm = -qRm;
        const negativeQSqm = -qSqm;

        await new db.sql.Request(transaction)
            .input('PaperID', db.sql.UniqueIdentifier, paperId)
            .input('QuantityRM', db.sql.Decimal(18, 2), negativeQRm)
            .input('QuantitySQM', db.sql.Decimal(18, 2), negativeQSqm)
            .query('UPDATE Papers SET StockRM = StockRM + @QuantityRM, StockSQM = StockSQM + @QuantitySQM, UpdatedAt = GETDATE() WHERE PaperID = @PaperID');

        await new db.sql.Request(transaction)
            .input('PaperID', db.sql.UniqueIdentifier, paperId)
            .input('BranchID', db.sql.UniqueIdentifier, paper.BranchID)
            .input('TransactionType', db.sql.NVarChar, 'Issued')
            .input('QuantityRM', db.sql.Decimal(18, 2), negativeQRm)
            .input('QuantitySQM', db.sql.Decimal(18, 2), negativeQSqm)
            .input('MachineID', db.sql.UniqueIdentifier, machineId)
            .input('JPCNumber', db.sql.NVarChar, jpcNumber)
            .input('Remarks', db.sql.NVarChar, remarks)
            .input('CreatedBy', db.sql.UniqueIdentifier, userId)
            .query(`
                INSERT INTO InventoryTransactions (PaperID, BranchID, TransactionType, QuantityRM, QuantitySQM, MachineID, JPCNumber, Remarks, CreatedBy)
                VALUES (@PaperID, @BranchID, @TransactionType, @QuantityRM, @QuantitySQM, @MachineID, @JPCNumber, @Remarks, @CreatedBy)
            `);

        await transaction.commit();
        res.status(200).json({ message: 'Paper issued successfully.' });

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

// @desc    Return paper stock
// @route   POST /api/inventory/return
// @access  Private (Requires 'add' on 'returnedPaperList')
const returnPaper = async (req, res, next) => {
    const { paperId, quantityKg, remarks } = req.body;
    const userId = req.user.UserID;

    if (!paperId || !quantityKg || parseFloat(quantityKg) <= 0) {
        return res.status(400).json({ message: 'Paper ID and a positive Quantity (KG) are required.' });
    }

    const pool = await db.getPool();
    const transaction = new db.sql.Transaction(pool);

    try {
        await transaction.begin();

        const paperResult = await new db.sql.Request(transaction)
            .input('PaperID', db.sql.UniqueIdentifier, paperId)
            .query('SELECT PaperID, BranchID, Width, GSM FROM Papers WHERE PaperID = @PaperID');

        if (paperResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Paper not found.' });
        }
        const paper = paperResult.recordset[0];
        const initialKg = parseFloat(quantityKg);

        // Apply deductions
        const adjustedKg = applyReturnedKgDeductions(initialKg, parseFloat(paper.Width));

        // Convert KG to RM
        const qRm = convertKgToRm(adjustedKg, parseFloat(paper.Width), parseInt(paper.GSM, 10));

        if (qRm <= 0) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Calculated Running Meters is zero or less after deductions. No stock was added.' });
        }

        // Convert RM to SQM
        const qSqm = convertRmToSqm(qRm, parseFloat(paper.Width));

        // Update stock
        await new db.sql.Request(transaction)
            .input('PaperID', db.sql.UniqueIdentifier, paperId)
            .input('QuantityRM', db.sql.Decimal(18, 2), qRm)
            .input('QuantitySQM', db.sql.Decimal(18, 2), qSqm)
            .query('UPDATE Papers SET StockRM = StockRM + @QuantityRM, StockSQM = StockSQM + @QuantitySQM, UpdatedAt = GETDATE() WHERE PaperID = @PaperID');

        // Log transaction
        await new db.sql.Request(transaction)
            .input('PaperID', db.sql.UniqueIdentifier, paperId)
            .input('BranchID', db.sql.UniqueIdentifier, paper.BranchID)
            .input('TransactionType', db.sql.NVarChar, 'Return')
            .input('QuantityRM', db.sql.Decimal(18, 2), qRm)
            .input('QuantitySQM', db.sql.Decimal(18, 2), qSqm)
            .input('QuantityKG', db.sql.Decimal(18, 2), initialKg) // Log the original KG amount
            .input('Remarks', db.sql.NVarChar, remarks)
            .input('CreatedBy', db.sql.UniqueIdentifier, userId)
            .query(`
                INSERT INTO InventoryTransactions (PaperID, BranchID, TransactionType, QuantityRM, QuantitySQM, QuantityKG, Remarks, CreatedBy)
                VALUES (@PaperID, @BranchID, @TransactionType, @QuantityRM, @QuantitySQM, @QuantityKG, @Remarks, @CreatedBy)
            `);

        await transaction.commit();
        res.status(200).json({
            message: 'Paper returned successfully.',
            returnedRm: qRm.toFixed(2)
        });

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

// @desc    Calculate returned RM from KG for frontend live preview
// @route   POST /api/inventory/calculate-return-rm
// @access  Private
const calculateReturnRm = async (req, res, next) => {
    const { paperId, quantityKg } = req.body;
    if (!paperId || quantityKg === null || quantityKg === undefined || parseFloat(quantityKg) < 0) {
        return res.status(400).json({ message: 'Paper ID and Quantity (KG) are required.' });
    }

    try {
        const pool = await db.getPool();
        const paperResult = await pool.request()
            .input('PaperID', db.sql.UniqueIdentifier, paperId)
            .query('SELECT Width, GSM FROM Papers WHERE PaperID = @PaperID');

        if (paperResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Paper not found.' });
        }
        const paper = paperResult.recordset[0];
        const initialKg = parseFloat(quantityKg);
        const adjustedKg = applyReturnedKgDeductions(initialKg, parseFloat(paper.Width));
        const calculatedRm = convertKgToRm(adjustedKg, parseFloat(paper.Width), parseInt(paper.GSM, 10));

        res.status(200).json({ calculatedRm: calculatedRm > 0 ? calculatedRm.toFixed(2) : '0.00' });
    } catch (error) {
        next(error);
    }
};


const adjustStock = async (req, res, next) => {
    const { paperId, adjustmentType, quantityRm, remarks } = req.body;
    const userId = req.user.UserID;

    if (!paperId || !adjustmentType || !quantityRm || !['Add', 'Subtract'].includes(adjustmentType) || parseFloat(quantityRm) <= 0) {
        return res.status(400).json({ message: 'Paper, Adjustment Type (Add/Subtract), and a positive Quantity are required.' });
    }

    const pool = await db.getPool();
    const transaction = new db.sql.Transaction(pool);

    try {
        await transaction.begin();
        const request = new db.sql.Request(transaction);

        const paperResult = await request
            .input('PaperID', db.sql.UniqueIdentifier, paperId)
            .query('SELECT * FROM Papers WHERE PaperID = @PaperID FOR UPDATE');

        if (paperResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Paper not found.' });
        }
        const paper = paperResult.recordset[0];
        const oldStockRm = parseFloat(paper.StockRM);
        let quantityToAdjust = parseFloat(quantityRm);

        if (adjustmentType === 'Subtract') {
            if (oldStockRm < quantityToAdjust) {
                await transaction.rollback();
                return res.status(400).json({ message: 'Cannot adjust stock below zero.' });
            }
            quantityToAdjust = -quantityToAdjust;
        }

        const newStockRm = oldStockRm + quantityToAdjust;
        const quantitySqmToAdjust = convertRmToSqm(quantityToAdjust, parseFloat(paper.Width));

        // 1. Update Paper Stock
        await new db.sql.Request(transaction)
            .input('PaperID', paper.PaperID)
            .input('NewStockRM', newStockRm)
            .input('NewStockSQM', parseFloat(paper.StockSQM) + quantitySqmToAdjust)
            .query('UPDATE Papers SET StockRM = @NewStockRM, StockSQM = @NewStockSQM, UpdatedAt = GETDATE() WHERE PaperID = @PaperID');

        // 2. Log in PaperAdjustments history
        await new db.sql.Request(transaction)
            .input('PaperID', paper.PaperID)
            .input('BranchID', paper.BranchID)
            .input('AdjustmentType', adjustmentType)
            .input('QuantityRM', parseFloat(quantityRm)) // Log the absolute amount
            .input('OldStockRM', oldStockRm)
            .input('NewStockRM', newStockRm)
            .input('Remarks', remarks)
            .input('AdjustedBy', userId)
            .query(`INSERT INTO PaperAdjustments (PaperID, BranchID, AdjustmentType, QuantityRM, OldStockRM, NewStockRM, Remarks, AdjustedBy)
                    VALUES (@PaperID, @BranchID, @AdjustmentType, @QuantityRM, @OldStockRM, @NewStockRM, @Remarks, @AdjustedBy)`);

        // 3. Log in main InventoryTransactions
        await new db.sql.Request(transaction)
            .input('PaperID', paper.PaperID)
            .input('BranchID', paper.BranchID)
            .input('TransactionType', `Adjust-${adjustmentType}`)
            .input('QuantityRM', quantityToAdjust)
            .input('QuantitySQM', quantitySqmToAdjust)
            .input('Remarks', remarks)
            .input('CreatedBy', userId)
            .query(`INSERT INTO InventoryTransactions (PaperID, BranchID, TransactionType, QuantityRM, QuantitySQM, Remarks, CreatedBy)
                    VALUES (@PaperID, @BranchID, @TransactionType, @QuantityRM, @QuantitySQM, @Remarks, @CreatedBy)`);

        await transaction.commit();
        res.status(200).json({ message: 'Stock adjusted successfully.' });

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

const rejectPaper = async (req, res, next) => {
    const { paperId, quantityRm, remarks } = req.body;
    const userId = req.user.UserID;

    if (!paperId || !quantityRm || parseFloat(quantityRm) <= 0) {
        return res.status(400).json({ message: 'Paper and a positive Quantity (RM) are required.' });
    }

    const pool = await db.getPool();
    const transaction = new db.sql.Transaction(pool);

    try {
        await transaction.begin();

        const paperResult = await new db.sql.Request(transaction)
            .input('PaperID', db.sql.UniqueIdentifier, paperId)
            .query('SELECT * FROM Papers WHERE PaperID = @PaperID FOR UPDATE');

        if (paperResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Paper not found.' });
        }
        const paper = paperResult.recordset[0];
        const qRm = parseFloat(quantityRm);

        if (paper.StockRM < qRm) {
            await transaction.rollback();
            return res.status(400).json({ message: `Insufficient stock. Available: ${paper.StockRM} RM, Required: ${qRm} RM.` });
        }

        const qSqm = convertRmToSqm(qRm, parseFloat(paper.Width));
        const negativeQRm = -qRm;
        const negativeQSqm = -qSqm;

        await new db.sql.Request(transaction)
            .input('PaperID', paper.PaperID)
            .input('QuantityRM', negativeQRm)
            .input('QuantitySQM', negativeQSqm)
            .query('UPDATE Papers SET StockRM = StockRM + @QuantityRM, StockSQM = StockSQM + @QuantitySQM, UpdatedAt = GETDATE() WHERE PaperID = @PaperID');

        await new db.sql.Request(transaction)
            .input('PaperID', paper.PaperID)
            .input('BranchID', paper.BranchID)
            .input('TransactionType', 'Reject')
            .input('QuantityRM', negativeQRm)
            .input('QuantitySQM', negativeQSqm)
            .input('Remarks', remarks)
            .input('CreatedBy', userId)
            .query(`INSERT INTO InventoryTransactions (PaperID, BranchID, TransactionType, QuantityRM, QuantitySQM, Remarks, CreatedBy)
                    VALUES (@PaperID, @BranchID, @TransactionType, @QuantityRM, @QuantitySQM, @Remarks, @CreatedBy)`);

        await transaction.commit();
        res.status(200).json({ message: 'Paper rejected successfully and stock deducted.' });

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

module.exports = {
    receivePaper,
    consumePaper,
    issuePaper,
    returnPaper,
    calculateReturnRm,
    adjustStock,
    rejectPaper,
};
