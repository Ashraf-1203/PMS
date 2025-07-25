-- Create InventoryTransactions Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[InventoryTransactions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[InventoryTransactions](
        [TransactionID] BIGINT IDENTITY(1,1) NOT NULL,
        [PaperID] UNIQUEIDENTIFIER NOT NULL,
        [BranchID] UNIQUEIDENTIFIER NOT NULL,
        [TransactionType] NVARCHAR(50) NOT NULL, -- e.g., 'Receive', 'Consume', 'Adjust-Add', 'Adjust-Subtract', 'Transfer-Out', 'Transfer-In', 'Return', 'Reject', 'Deckle-Source', 'Deckle-Target'
        [QuantityRM] DECIMAL(18, 2) NOT NULL,
        [QuantitySQM] DECIMAL(18, 2) NOT NULL,
        [QuantityKG] DECIMAL(18, 2) NULL,
        [RelatedTransactionID] BIGINT NULL, -- For linking transfers between branches
        [MachineID] UNIQUEIDENTIFIER NULL,
        [JPCNumber] NVARCHAR(100) NULL,
        [Remarks] NVARCHAR(MAX) NULL,
        [CreatedBy] UNIQUEIDENTIFIER NOT NULL,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT DF_InventoryTransactions_CreatedAt DEFAULT GETDATE(),

        CONSTRAINT PK_InventoryTransactions PRIMARY KEY CLUSTERED ([TransactionID] ASC),
        CONSTRAINT FK_InventoryTransactions_PaperID FOREIGN KEY ([PaperID]) REFERENCES [dbo].[Papers]([PaperID]), -- ON DELETE NO ACTION - prevent deletion if history exists
        CONSTRAINT FK_InventoryTransactions_BranchID FOREIGN KEY ([BranchID]) REFERENCES [dbo].[Branches]([BranchID]), -- ON DELETE NO ACTION
        CONSTRAINT FK_InventoryTransactions_MachineID FOREIGN KEY ([MachineID]) REFERENCES [dbo].[Machines]([MachineID]),
        CONSTRAINT FK_InventoryTransactions_CreatedBy FOREIGN KEY ([CreatedBy]) REFERENCES [dbo].[Users]([UserID]),
        CONSTRAINT FK_InventoryTransactions_RelatedTransaction FOREIGN KEY ([RelatedTransactionID]) REFERENCES [dbo].[InventoryTransactions]([TransactionID]),
        CONSTRAINT CHK_TransactionType CHECK (TransactionType IN (
            'Receive', 'Consume', 'Adjust-Add', 'Adjust-Subtract', 'Transfer-Out',
            'Transfer-In', 'Return', 'Reject', 'Deckle-Source', 'Deckle-Target', 'Issued'
        ))
    );
    PRINT 'Table [dbo].[InventoryTransactions] created successfully.';
END
ELSE
BEGIN
    PRINT 'Table [dbo].[InventoryTransactions] already exists.';
END
GO
