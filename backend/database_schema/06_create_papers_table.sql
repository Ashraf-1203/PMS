-- Create Papers Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Papers]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Papers](
        [PaperID] UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Papers_PaperID DEFAULT NEWID(),
        [Manufacturer] NVARCHAR(255) NOT NULL,
        [Grade] NVARCHAR(255) NOT NULL,
        [Width] DECIMAL(10, 2) NOT NULL, -- in mm
        [GSM] INT NOT NULL, -- Grams per Square Meter
        [Rate] DECIMAL(18, 4) NOT NULL, -- Rate per SQM
        [StockRM] DECIMAL(18, 2) NOT NULL CONSTRAINT DF_Papers_StockRM DEFAULT 0, -- Stock in Running Meters
        [StockSQM] DECIMAL(18, 2) NOT NULL CONSTRAINT DF_Papers_StockSQM DEFAULT 0, -- Stock in Square Meters
        [BranchID] UNIQUEIDENTIFIER NOT NULL,
        [IsActive] BIT NOT NULL CONSTRAINT DF_Papers_IsActive DEFAULT 1,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT DF_Papers_CreatedAt DEFAULT GETDATE(),
        [UpdatedAt] DATETIME2 NOT NULL CONSTRAINT DF_Papers_UpdatedAt DEFAULT GETDATE(),
        CONSTRAINT PK_Papers PRIMARY KEY CLUSTERED ([PaperID] ASC),
        CONSTRAINT FK_Papers_BranchID FOREIGN KEY ([BranchID]) REFERENCES [dbo].[Branches]([BranchID]) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT UQ_Paper_Definition_Per_Branch UNIQUE ([Manufacturer], [Grade], [Width], [BranchID])
    );
    PRINT 'Table [dbo].[Papers] created successfully.';
END
ELSE
BEGIN
    PRINT 'Table [dbo].[Papers] already exists.';
END
GO

-- Add a trigger to update UpdatedAt timestamp
IF OBJECT_ID ('dbo.trg_Papers_UpdateUpdatedAt', 'TR') IS NOT NULL
    DROP TRIGGER dbo.trg_Papers_UpdateUpdatedAt;
GO
CREATE TRIGGER trg_Papers_UpdateUpdatedAt
ON dbo.Papers
AFTER UPDATE
AS
BEGIN
    IF TRIGGER_NESTLEVEL() > 1
        RETURN;
    UPDATE dbo.Papers
    SET UpdatedAt = GETDATE()
    FROM dbo.Papers p
    INNER JOIN inserted i ON p.PaperID = i.PaperID;
END;
GO
PRINT 'Trigger trg_Papers_UpdateUpdatedAt for Papers table created/updated.';
GO
