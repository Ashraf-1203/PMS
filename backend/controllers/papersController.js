const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { convertRmToSqm } = require('../utils/calculationUtils');

// @desc    Get all papers with pagination and filtering
// @route   GET /api/papers
// @access  Private (Requires 'view' permission on 'papersMasterList')
const getPapers = async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30;
    const offset = (page - 1) * limit;

    try {
        const pool = await db.getPool();
        const request = pool.request()
            .input('Offset', db.sql.Int, offset)
            .input('Limit', db.sql.Int, limit);

        const result = await request.query(\`
            SELECT p.*, b.BranchName
            FROM Papers p
            JOIN Branches b ON p.BranchID = b.BranchID
            ORDER BY p.Manufacturer, p.Grade, p.Width
            OFFSET @Offset ROWS
            FETCH NEXT @Limit ROWS ONLY;
        \`);

        const totalResult = await pool.request().query('SELECT COUNT(*) as total FROM Papers');
        const total = totalResult.recordset[0].total;

        res.status(200).json({
            papers: result.recordset,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single paper by ID
// @route   GET /api/papers/:id
// @access  Private (Requires 'view' permission on 'papersMasterList')
const getPaperById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await db.getPool();
    const result = await pool.request()
      .input('PaperID', db.sql.UniqueIdentifier, id)
      .query(\`
        SELECT p.*, b.BranchName
        FROM Papers p
        JOIN Branches b ON p.BranchID = b.BranchID
        WHERE p.PaperID = @PaperID
      \`);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Paper not found' });
    }
    res.status(200).json(result.recordset[0]);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new paper
// @route   POST /api/papers
// @access  Private (Requires 'add' permission on 'papersMasterList')
const createPaper = async (req, res, next) => {
  const { manufacturer, grade, width, gsm, rate, initialStockRm = 0, branchId } = req.body;

  if (!manufacturer || !grade || !width || !gsm || !rate || !branchId) {
    return res.status(400).json({ message: 'Manufacturer, grade, width, gsm, rate, and branchId are required.' });
  }

  try {
    const pool = await db.getPool();

    // Check for duplicates based on unique constraint
    const duplicateCheck = await pool.request()
        .input('Manufacturer', db.sql.NVarChar, manufacturer)
        .input('Grade', db.sql.NVarChar, grade)
        .input('Width', db.sql.Decimal(10, 2), width)
        .input('BranchID', db.sql.UniqueIdentifier, branchId)
        .query('SELECT PaperID FROM Papers WHERE Manufacturer = @Manufacturer AND Grade = @Grade AND Width = @Width AND BranchID = @BranchID');

    if (duplicateCheck.recordset.length > 0) {
        return res.status(409).json({ message: 'This paper (Manufacturer, Grade, Width) already exists in this branch.' });
    }

    const paperId = uuidv4();
    const stockRm = parseFloat(initialStockRm) || 0;
    const stockSqm = convertRmToSqm(stockRm, parseFloat(width));

    const result = await pool.request()
      .input('PaperID', db.sql.UniqueIdentifier, paperId)
      .input('Manufacturer', db.sql.NVarChar, manufacturer)
      .input('Grade', db.sql.NVarChar, grade)
      .input('Width', db.sql.Decimal(10, 2), width)
      .input('GSM', db.sql.Int, gsm)
      .input('Rate', db.sql.Decimal(18, 4), rate)
      .input('StockRM', db.sql.Decimal(18, 2), stockRm)
      .input('StockSQM', db.sql.Decimal(18, 2), stockSqm)
      .input('BranchID', db.sql.UniqueIdentifier, branchId)
      .query(\`
        INSERT INTO Papers (PaperID, Manufacturer, Grade, Width, GSM, Rate, StockRM, StockSQM, BranchID)
        VALUES (@PaperID, @Manufacturer, @Grade, @Width, @GSM, @Rate, @StockRM, @StockSQM, @BranchID);
        SELECT p.*, b.BranchName
        FROM Papers p
        JOIN Branches b ON p.BranchID = b.BranchID
        WHERE p.PaperID = @PaperID;
      \`);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a paper
// @route   PUT /api/papers/:id
// @access  Private (Requires 'edit' permission on 'papersMasterList')
const updatePaper = async (req, res, next) => {
  try {
    const { id } = req.params;
    // For now, only allowing update of rate and manufacturer/grade.
    // Width/GSM changes would require complex stock recalculations. Stock is adjusted via other transactions.
    const { manufacturer, grade, rate } = req.body;

    if (!manufacturer || !grade || !rate) {
        return res.status(400).json({ message: 'Manufacturer, grade, and rate are required for update.' });
    }

    const pool = await db.getPool();
    const result = await pool.request()
      .input('PaperID', db.sql.UniqueIdentifier, id)
      .input('Manufacturer', db.sql.NVarChar, manufacturer)
      .input('Grade', db.sql.NVarChar, grade)
      .input('Rate', db.sql.Decimal(18, 4), rate)
      .query(\`
        UPDATE Papers
        SET
          Manufacturer = @Manufacturer,
          Grade = @Grade,
          Rate = @Rate,
          UpdatedAt = GETDATE()
        WHERE PaperID = @PaperID;

        SELECT p.*, b.BranchName
        FROM Papers p
        JOIN Branches b ON p.BranchID = b.BranchID
        WHERE p.PaperID = @PaperID;
      \`);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Paper not found or no changes made.' });
    }
    res.status(200).json(result.recordset[0]);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a paper (soft delete by setting IsActive = 0)
// @route   DELETE /api/papers/:id
// @access  Private (Requires 'delete' permission on 'papersMasterList')
const deletePaper = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await db.getPool();

    // Check if the paper has stock. If so, prevent deletion.
    const stockCheck = await pool.request()
        .input('PaperID', db.sql.UniqueIdentifier, id)
        .query('SELECT StockRM FROM Papers WHERE PaperID = @PaperID');

    if (stockCheck.recordset.length > 0 && stockCheck.recordset[0].StockRM > 0) {
        return res.status(400).json({ message: 'Cannot delete paper with existing stock. Please adjust stock to zero first.' });
    }

    const result = await pool.request()
      .input('PaperID', db.sql.UniqueIdentifier, id)
      .query(\`
        UPDATE Papers
        SET IsActive = 0, UpdatedAt = GETDATE()
        WHERE PaperID = @PaperID AND IsActive = 1;
      \`);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Paper not found or already inactive.' });
    }
    res.status(200).json({ message: 'Paper deactivated successfully' });
  } catch (error) {
    next(error);
  }
};


const deckleMatch = async (req, res, next) => {
    const { sourcePaperId, cutWidth, quantityRm } = req.body;
    const userId = req.user.UserID;

    if (!sourcePaperId || !cutWidth || !quantityRm || parseFloat(cutWidth) <= 0 || parseFloat(quantityRm) <= 0) {
        return res.status(400).json({ message: 'Source Paper, a positive Cut Width, and a positive Quantity RM are required.' });
    }

    const pool = await db.getPool();
    const transaction = new db.sql.Transaction(pool);

    try {
        await transaction.begin();
        const request = new db.sql.Request(transaction);

        // 1. Get source paper details and lock the row
        const sourcePaperResult = await request
            .input('SourcePaperID', db.sql.UniqueIdentifier, sourcePaperId)
            .query('SELECT * FROM Papers WHERE PaperID = @SourcePaperID FOR UPDATE');

        if (sourcePaperResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Source paper not found.' });
        }
        const sourcePaper = sourcePaperResult.recordset[0];

        const qRm = parseFloat(quantityRm);
        const cWidth = parseFloat(cutWidth);
        const sourceWidth = parseFloat(sourcePaper.Width);

        // 2. Validate stock and width
        if (sourcePaper.StockRM < qRm) {
            await transaction.rollback();
            return res.status(400).json({ message: `Insufficient stock. Available: ${sourcePaper.StockRM} RM, Required: ${qRm} RM.` });
        }
        if (cWidth >= sourceWidth) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Cut width must be less than the source paper width.' });
        }

        const resultingWidth1 = cWidth;
        const resultingWidth2 = sourceWidth - cWidth;

        // 3. Find or create target papers
        const findOrCreatePaper = async (width) => {
            const findReq = new db.sql.Request(transaction);
            const existingPaper = await findReq
                .input('Manufacturer', db.sql.NVarChar, sourcePaper.Manufacturer)
                .input('Grade', db.sql.NVarChar, sourcePaper.Grade)
                .input('Width', db.sql.Decimal(10, 2), width)
                .input('BranchID', db.sql.UniqueIdentifier, sourcePaper.BranchID)
                .query('SELECT * FROM Papers WHERE Manufacturer = @Manufacturer AND Grade = @Grade AND Width = @Width AND BranchID = @BranchID');

            if (existingPaper.recordset.length > 0) {
                return existingPaper.recordset[0];
            } else {
                const createReq = new db.sql.Request(transaction);
                const newPaperId = uuidv4();
                const newPaperResult = await createReq
                    .input('PaperID', db.sql.UniqueIdentifier, newPaperId)
                    .input('Manufacturer', db.sql.NVarChar, sourcePaper.Manufacturer)
                    .input('Grade', db.sql.NVarChar, sourcePaper.Grade)
                    .input('Width', db.sql.Decimal(10, 2), width)
                    .input('GSM', db.sql.Int, sourcePaper.GSM)
                    .input('Rate', db.sql.Decimal(18, 4), sourcePaper.Rate) // Rate might need adjustment based on business rules
                    .input('BranchID', db.sql.UniqueIdentifier, sourcePaper.BranchID)
                    .query(`
                        INSERT INTO Papers (PaperID, Manufacturer, Grade, Width, GSM, Rate, BranchID)
                        VALUES (@PaperID, @Manufacturer, @Grade, @Width, @GSM, @Rate, @BranchID);
                        SELECT * FROM Papers WHERE PaperID = @PaperID;
                    `);
                return newPaperResult.recordset[0];
            }
        };

        const targetPaper1 = await findOrCreatePaper(resultingWidth1);
        const targetPaper2 = await findOrCreatePaper(resultingWidth2);

        // 4. Update stock levels
        const qSqmSource = convertRmToSqm(qRm, sourceWidth);
        const qSqmTarget1 = convertRmToSqm(qRm, resultingWidth1);
        const qSqmTarget2 = convertRmToSqm(qRm, resultingWidth2);

        // Deduct from source
        await new db.sql.Request(transaction).input('ID', sourcePaper.PaperID).input('RM', -qRm).input('SQM', -qSqmSource).query('UPDATE Papers SET StockRM = StockRM + @RM, StockSQM = StockSQM + @SQM WHERE PaperID = @ID');
        // Add to target 1
        await new db.sql.Request(transaction).input('ID', targetPaper1.PaperID).input('RM', qRm).input('SQM', qSqmTarget1).query('UPDATE Papers SET StockRM = StockRM + @RM, StockSQM = StockSQM + @SQM WHERE PaperID = @ID');
        // Add to target 2
        await new db.sql.Request(transaction).input('ID', targetPaper2.PaperID).input('RM', qRm).input('SQM', qSqmTarget2).query('UPDATE Papers SET StockRM = StockRM + @RM, StockSQM = StockSQM + @SQM WHERE PaperID = @ID');

        // 5. Log transactions
        const logTransaction = async (pId, bId, type, rm, sqm) => {
            const logReq = new db.sql.Request(transaction);
            await logReq
                .input('PaperID', pId)
                .input('BranchID', bId)
                .input('TransactionType', type)
                .input('QuantityRM', rm)
                .input('QuantitySQM', sqm)
                .input('CreatedBy', userId)
                .query(`INSERT INTO InventoryTransactions (PaperID, BranchID, TransactionType, QuantityRM, QuantitySQM, CreatedBy) VALUES (@PaperID, @BranchID, @TransactionType, @QuantityRM, @QuantitySQM, @CreatedBy)`);
        };
        await logTransaction(sourcePaper.PaperID, sourcePaper.BranchID, 'Deckle-Source', -qRm, -qSqmSource);
        await logTransaction(targetPaper1.PaperID, targetPaper1.BranchID, 'Deckle-Target', qRm, qSqmTarget1);
        await logTransaction(targetPaper2.PaperID, targetPaper2.BranchID, 'Deckle-Target', qRm, qSqmTarget2);

        // 6. Log deckle history
        await new db.sql.Request(transaction)
            .input('SourcePaperID', sourcePaper.PaperID)
            .input('SourceWidth', sourceWidth)
            .input('CutWidth', cWidth)
            .input('ResultingWidth1', resultingWidth1)
            .input('ResultingWidth2', resultingWidth2)
            .input('TargetPaperID1', targetPaper1.PaperID)
            .input('TargetPaperID2', targetPaper2.PaperID)
            .input('QuantityRM', qRm)
            .input('PerformedBy', userId)
            .query(`INSERT INTO DeckleHistory (SourcePaperID, SourceWidth, CutWidth, ResultingWidth1, ResultingWidth2, TargetPaperID1, TargetPaperID2, QuantityRM, PerformedBy)
                    VALUES (@SourcePaperID, @SourceWidth, @CutWidth, @ResultingWidth1, @ResultingWidth2, @TargetPaperID1, @TargetPaperID2, @QuantityRM, @PerformedBy)`);


        await transaction.commit();
        res.status(200).json({ message: 'Deckle match completed successfully.' });

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};


const xlsx = require('xlsx');

const importPapers = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    const { branchId } = req.body;
    if (!branchId) {
        return res.status(400).json({ message: 'Branch ID is required for import.' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
        return res.status(400).json({ message: 'Excel file is empty or data could not be read.' });
    }

    const pool = await db.getPool();
    const transaction = new db.sql.Transaction(pool);

    let successCount = 0;
    let failureCount = 0;
    const errors = [];

    try {
        await transaction.begin();

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const { manufacturer, grade, width, gsm, rate } = row;

            if (!manufacturer || !grade || !width || !gsm || !rate) {
                failureCount++;
                errors.push({ row: i + 2, message: 'Missing required fields (manufacturer, grade, width, gsm, rate).' });
                continue;
            }

            try {
                const duplicateCheck = await new db.sql.Request(transaction)
                    .input('Manufacturer', db.sql.NVarChar, manufacturer)
                    .input('Grade', db.sql.NVarChar, grade)
                    .input('Width', db.sql.Decimal(10, 2), width)
                    .input('BranchID', db.sql.UniqueIdentifier, branchId)
                    .query('SELECT PaperID FROM Papers WHERE Manufacturer = @Manufacturer AND Grade = @Grade AND Width = @Width AND BranchID = @BranchID');

                if (duplicateCheck.recordset.length > 0) {
                    failureCount++;
                    errors.push({ row: i + 2, message: 'Duplicate paper definition found in this branch.' });
                    continue;
                }

                const paperId = uuidv4();
                await new db.sql.Request(transaction)
                    .input('PaperID', db.sql.UniqueIdentifier, paperId)
                    .input('Manufacturer', db.sql.NVarChar, manufacturer)
                    .input('Grade', db.sql.NVarChar, grade)
                    .input('Width', db.sql.Decimal(10, 2), width)
                    .input('GSM', db.sql.Int, gsm)
                    .input('Rate', db.sql.Decimal(18, 4), rate)
                    .input('BranchID', db.sql.UniqueIdentifier, branchId)
                    .query(`
                        INSERT INTO Papers (PaperID, Manufacturer, Grade, Width, GSM, Rate, BranchID, StockRM, StockSQM)
                        VALUES (@PaperID, @Manufacturer, @Grade, @Width, @GSM, @Rate, @BranchID, 0, 0)
                    `);

                successCount++;
            } catch (err) {
                failureCount++;
                errors.push({ row: i + 2, message: `Database error: ${err.message}` });
            }
        }

        if (failureCount > 0 && successCount === 0) {
            await transaction.rollback();
            return res.status(400).json({
                message: 'All rows failed to import. No changes were made.',
                successCount,
                failureCount,
                errors,
            });
        }

        await transaction.commit();
        res.status(201).json({
            message: 'Import process completed.',
            successCount,
            failureCount,
            errors,
        });

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

module.exports = {
  getPapers,
  getPaperById,
  createPaper,
  updatePaper,
  deletePaper,
  deckleMatch,
  importPapers,
};
const xlsx = require('xlsx');

const importPapers = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    // For simplicity, assuming a single branch context for import, passed in body.
    // A more complex implementation could have 'branch' as a column in the Excel file.
    const { branchId } = req.body;
    if (!branchId) {
        return res.status(400).json({ message: 'Branch ID is required for import.' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
        return res.status(400).json({ message: 'Excel file is empty or data could not be read.' });
    }

    const pool = await db.getPool();
    const transaction = new db.sql.Transaction(pool);

    let successCount = 0;
    let failureCount = 0;
    const errors = [];
    const createdPapers = [];

    try {
        await transaction.begin();

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const { manufacturer, grade, width, gsm, rate } = row;

            if (!manufacturer || !grade || !width || !gsm || !rate) {
                failureCount++;
                errors.push({ row: i + 2, message: 'Missing required fields (manufacturer, grade, width, gsm, rate).' });
                continue;
            }

            try {
                // Check for duplicates within the same transaction
                const duplicateCheck = await new db.sql.Request(transaction)
                    .input('Manufacturer', db.sql.NVarChar, manufacturer)
                    .input('Grade', db.sql.NVarChar, grade)
                    .input('Width', db.sql.Decimal(10, 2), width)
                    .input('BranchID', db.sql.UniqueIdentifier, branchId)
                    .query('SELECT PaperID FROM Papers WHERE Manufacturer = @Manufacturer AND Grade = @Grade AND Width = @Width AND BranchID = @BranchID');

                if (duplicateCheck.recordset.length > 0) {
                    failureCount++;
                    errors.push({ row: i + 2, message: 'Duplicate paper definition found in this branch.' });
                    continue;
                }

                const paperId = uuidv4();
                await new db.sql.Request(transaction)
                    .input('PaperID', db.sql.UniqueIdentifier, paperId)
                    .input('Manufacturer', db.sql.NVarChar, manufacturer)
                    .input('Grade', db.sql.NVarChar, grade)
                    .input('Width', db.sql.Decimal(10, 2), width)
                    .input('GSM', db.sql.Int, gsm)
                    .input('Rate', db.sql.Decimal(18, 4), rate)
                    .input('BranchID', db.sql.UniqueIdentifier, branchId)
                    .query(`
                        INSERT INTO Papers (PaperID, Manufacturer, Grade, Width, GSM, Rate, BranchID, StockRM, StockSQM)
                        VALUES (@PaperID, @Manufacturer, @Grade, @Width, @GSM, @Rate, @BranchID, 0, 0)
                    `);

                successCount++;
            } catch (err) {
                failureCount++;
                errors.push({ row: i + 2, message: `Database error: ${err.message}` });
            }
        }

        if (failureCount > 0 && successCount === 0) {
             // If all failed, roll back
            await transaction.rollback();
            return res.status(400).json({
                message: 'All rows failed to import. No changes were made.',
                successCount,
                failureCount,
                errors,
            });
        }

        // If some succeeded, commit the transaction
        await transaction.commit();
        res.status(201).json({
            message: 'Import process completed.',
            successCount,
            failureCount,
            errors,
        });

    } catch (error) {
        // This catches errors with transaction.begin() or transaction.commit() itself
        await transaction.rollback();
        next(error);
    }
};

module.exports = {
  getPapers,
  getPaperById,
  createPaper,
  updatePaper,
  deletePaper,
  deckleMatch,
  importPapers,
};
