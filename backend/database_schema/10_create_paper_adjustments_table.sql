-- Create PaperAdjustments Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PaperAdjustments]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[PaperAdjustments](
        [AdjustmentID] BIGINT IDENTITY(1,1) NOT NULL,
        [PaperID] UNIQUEIDENTIFIER NOT NULL,
        [BranchID] UNIQUEIDENTIFIER NOT NULL,
        [AdjustmentType] NVARCHAR(20) NOT NULL CONSTRAINT CHK_AdjustmentType CHECK (AdjustmentType IN ('Add', 'Subtract')),
        [QuantityRM] DECIMAL(18, 2) NOT NULL,
        [OldStockRM] DECIMAL(18, 2) NOT NULL,
        [NewStockRM] DECIMAL(18, 2) NOT NULL,
        [Remarks] NVARCHAR(MAX) NULL,
        [AdjustedBy] UNIQUEIDENTIFIER NOT NULL,
        [AdjustedAt] DATETIME2 NOT NULL CONSTRAINT DF_PaperAdjustments_AdjustedAt DEFAULT GETDATE(),

        CONSTRAINT PK_PaperAdjustments PRIMARY KEY CLUSTERED ([AdjustmentID] ASC),
        CONSTRAINT FK_PaperAdjustments_PaperID FOREIGN KEY ([PaperID]) REFERENCES [dbo].[Papers]([PaperID]),
        CONSTRAINT FK_PaperAdjustments_BranchID FOREIGN KEY ([BranchID]) REFERENCES [dbo].[Branches]([BranchID]),
        CONSTRAINT FK_PaperAdjustments_AdjustedBy FOREIGN KEY ([AdjustedBy]) REFERENCES [dbo].[Users]([UserID])
    );
    PRINT 'Table [dbo].[PaperAdjustments] created successfully.';
END
ELSE
BEGIN
    PRINT 'Table [dbo].[PaperAdjustments] already exists.';
END
GO
