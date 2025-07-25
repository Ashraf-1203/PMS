-- Create Users Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Users](
        [UserID] UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Users_UserID DEFAULT NEWID(),
        [Username] NVARCHAR(255) NOT NULL,
        [PasswordHash] NVARCHAR(MAX) NOT NULL,
        [FullName] NVARCHAR(255) NULL,
        [Email] NVARCHAR(255) NULL,
        [RoleID] INT NULL, -- Nullable if a default role is not immediately assigned or if user creation is a two-step process
        [BranchID] UNIQUEIDENTIFIER NULL, -- Nullable as Admin might not be tied to a specific branch
        [IsActive] BIT NOT NULL CONSTRAINT DF_Users_IsActive DEFAULT 1,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT GETDATE(),
        [UpdatedAt] DATETIME2 NOT NULL CONSTRAINT DF_Users_UpdatedAt DEFAULT GETDATE(),
        [LastLogin] DATETIME2 NULL,
        CONSTRAINT PK_Users PRIMARY KEY CLUSTERED ([UserID] ASC),
        CONSTRAINT UQ_Users_Username UNIQUE ([Username]),
        CONSTRAINT UQ_Users_Email UNIQUE ([Email]), -- Assuming email should be unique if provided
        CONSTRAINT FK_Users_RoleID FOREIGN KEY ([RoleID]) REFERENCES [dbo].[Roles]([RoleID]) ON DELETE SET NULL ON UPDATE CASCADE,
        -- CONSTRAINT FK_Users_BranchID FOREIGN KEY ([BranchID]) REFERENCES [dbo].[Branches]([BranchID]) ON DELETE SET NULL ON UPDATE CASCADE -- Add this once Branches table is created
    );
    PRINT 'Table [dbo].[Users] created successfully.';

    -- Note: Seeding an admin user will be done in a separate script or manually
    -- after hashing logic is implemented in the backend.
    -- For now, ensure the 'Admin' role exists from the previous script.
    -- Example of how to insert admin later (password needs to be hashed by the app):
    -- DECLARE @AdminRoleID INT;
    -- SELECT @AdminRoleID = RoleID FROM Roles WHERE RoleName = 'Admin';
    -- IF @AdminRoleID IS NOT NULL
    -- BEGIN
    --     INSERT INTO Users (Username, PasswordHash, FullName, Email, RoleID, IsActive)
    --     VALUES ('admin', 'hashed_admin_password_placeholder', 'Administrator', 'admin@example.com', @AdminRoleID, 1);
    --     PRINT 'Default admin user placeholder added (requires password hashing).';
    -- END
END
ELSE
BEGIN
    PRINT 'Table [dbo].[Users] already exists.';
END
GO

-- Add a trigger to update UpdatedAt timestamp
IF OBJECT_ID ('dbo.trg_Users_UpdateUpdatedAt', 'TR') IS NOT NULL
    DROP TRIGGER dbo.trg_Users_UpdateUpdatedAt;
GO
CREATE TRIGGER trg_Users_UpdateUpdatedAt
ON dbo.Users
AFTER UPDATE
AS
BEGIN
    IF TRIGGER_NESTLEVEL() > 1
        RETURN;
    UPDATE dbo.Users
    SET UpdatedAt = GETDATE()
    FROM dbo.Users u
    INNER JOIN inserted i ON u.UserID = i.UserID;
END;
GO
PRINT 'Trigger trg_Users_UpdateUpdatedAt for Users table created/updated.';
GO
