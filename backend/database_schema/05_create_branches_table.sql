-- Create Branches Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Branches]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Branches](
        [BranchID] UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Branches_BranchID DEFAULT NEWID(),
        [BranchName] NVARCHAR(255) NOT NULL,
        [Location] NVARCHAR(MAX) NULL,
        [IsActive] BIT NOT NULL CONSTRAINT DF_Branches_IsActive DEFAULT 1,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT DF_Branches_CreatedAt DEFAULT GETDATE(),
        [UpdatedAt] DATETIME2 NOT NULL CONSTRAINT DF_Branches_UpdatedAt DEFAULT GETDATE(),
        CONSTRAINT PK_Branches PRIMARY KEY CLUSTERED ([BranchID] ASC),
        CONSTRAINT UQ_Branches_BranchName UNIQUE ([BranchName])
    );
    PRINT 'Table [dbo].[Branches] created successfully.';

    -- Seed a default branch
    INSERT INTO [dbo].[Branches] (BranchName, Location) VALUES ('Main Branch', 'Head Office Location');
    PRINT 'Default "Main Branch" seeded into [dbo].[Branches].';
END
ELSE
BEGIN
    PRINT 'Table [dbo].[Branches] already exists.';
END
GO

-- Add a trigger to update UpdatedAt timestamp
IF OBJECT_ID ('dbo.trg_Branches_UpdateUpdatedAt', 'TR') IS NOT NULL
    DROP TRIGGER dbo.trg_Branches_UpdateUpdatedAt;
GO
CREATE TRIGGER trg_Branches_UpdateUpdatedAt
ON dbo.Branches
AFTER UPDATE
AS
BEGIN
    IF TRIGGER_NESTLEVEL() > 1
        RETURN;
    UPDATE dbo.Branches
    SET UpdatedAt = GETDATE()
    FROM dbo.Branches b
    INNER JOIN inserted i ON b.BranchID = i.BranchID;
END;
GO
PRINT 'Trigger trg_Branches_UpdateUpdatedAt for Branches table created/updated.';
GO

-- After creating Branches table, add the foreign key constraint to the Users table
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Users_BranchID' AND parent_object_id = OBJECT_ID('dbo.Users'))
BEGIN
    ALTER TABLE [dbo].[Users]
    ADD CONSTRAINT FK_Users_BranchID FOREIGN KEY ([BranchID]) REFERENCES [dbo].[Branches]([BranchID]) ON DELETE SET NULL ON UPDATE CASCADE;
    PRINT 'Foreign key constraint FK_Users_BranchID added to Users table.';
END
GO
