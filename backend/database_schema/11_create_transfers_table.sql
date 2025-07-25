-- Create Transfers Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Transfers]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Transfers](
        [TransferID] UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Transfers_TransferID DEFAULT NEWID(),
        [SourceBranchID] UNIQUEIDENTIFIER NOT NULL,
        [DestinationBranchID] UNIQUEIDENTIFIER NOT NULL,
        [PaperID] UNIQUEIDENTIFIER NOT NULL,
        [QuantityRM] DECIMAL(18, 2) NOT NULL,
        [Status] NVARCHAR(20) NOT NULL CONSTRAINT CHK_TransferStatus CHECK (Status IN ('Pending', 'Approved', 'Rejected')) CONSTRAINT DF_Transfers_Status DEFAULT 'Pending',
        [SentBy] UNIQUEIDENTIFIER NOT NULL,
        [ApprovedBy] UNIQUEIDENTIFIER NULL, -- Null until approved/rejected
        [SentAt] DATETIME2 NOT NULL CONSTRAINT DF_Transfers_SentAt DEFAULT GETDATE(),
        [ActionAt] DATETIME2 NULL, -- Timestamp for approval/rejection
        [Remarks] NVARCHAR(MAX) NULL,

        CONSTRAINT PK_Transfers PRIMARY KEY CLUSTERED ([TransferID] ASC),
        CONSTRAINT FK_Transfers_SourceBranch FOREIGN KEY ([SourceBranchID]) REFERENCES [dbo].[Branches]([BranchID]),
        CONSTRAINT FK_Transfers_DestinationBranch FOREIGN KEY ([DestinationBranchID]) REFERENCES [dbo].[Branches]([BranchID]),
        CONSTRAINT FK_Transfers_Paper FOREIGN KEY ([PaperID]) REFERENCES [dbo].[Papers]([PaperID]),
        CONSTRAINT FK_Transfers_SentBy FOREIGN KEY ([SentBy]) REFERENCES [dbo].[Users]([UserID]),
        CONSTRAINT FK_Transfers_ApprovedBy FOREIGN KEY ([ApprovedBy]) REFERENCES [dbo].[Users]([UserID]),
        CONSTRAINT CHK_Branch_Not_Same CHECK (SourceBranchID <> DestinationBranchID)
    );
    PRINT 'Table [dbo].[Transfers] created successfully.';
END
ELSE
BEGIN
    PRINT 'Table [dbo].[Transfers] already exists.';
END
GO
