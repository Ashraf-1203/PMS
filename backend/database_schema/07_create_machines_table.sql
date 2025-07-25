-- Create Machines Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Machines]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Machines](
        [MachineID] UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Machines_MachineID DEFAULT NEWID(),
        [Name] NVARCHAR(255) NOT NULL,
        [BranchID] UNIQUEIDENTIFIER NOT NULL,
        [IsActive] BIT NOT NULL CONSTRAINT DF_Machines_IsActive DEFAULT 1,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT DF_Machines_CreatedAt DEFAULT GETDATE(),
        [UpdatedAt] DATETIME2 NOT NULL CONSTRAINT DF_Machines_UpdatedAt DEFAULT GETDATE(),
        CONSTRAINT PK_Machines PRIMARY KEY CLUSTERED ([MachineID] ASC),
        CONSTRAINT FK_Machines_BranchID FOREIGN KEY ([BranchID]) REFERENCES [dbo].[Branches]([BranchID]) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT UQ_Machine_Name_Per_Branch UNIQUE ([Name], [BranchID])
    );
    PRINT 'Table [dbo].[Machines] created successfully.';
END
ELSE
BEGIN
    PRINT 'Table [dbo].[Machines] already exists.';
END
GO

-- Add a trigger to update UpdatedAt timestamp
IF OBJECT_ID ('dbo.trg_Machines_UpdateUpdatedAt', 'TR') IS NOT NULL
    DROP TRIGGER dbo.trg_Machines_UpdateUpdatedAt;
GO
CREATE TRIGGER trg_Machines_UpdateUpdatedAt
ON dbo.Machines
AFTER UPDATE
AS
BEGIN
    IF TRIGGER_NESTLEVEL() > 1
        RETURN;
    UPDATE dbo.Machines
    SET UpdatedAt = GETDATE()
    FROM dbo.Machines m
    INNER JOIN inserted i ON m.MachineID = i.MachineID;
END;
GO
PRINT 'Trigger trg_Machines_UpdateUpdatedAt for Machines table created/updated.';
GO
