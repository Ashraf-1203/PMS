-- Create Roles Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Roles]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Roles](
        [RoleID] INT IDENTITY(1,1) NOT NULL,
        [RoleName] NVARCHAR(50) NOT NULL,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT DF_Roles_CreatedAt DEFAULT GETDATE(),
        [UpdatedAt] DATETIME2 NOT NULL CONSTRAINT DF_Roles_UpdatedAt DEFAULT GETDATE(),
        CONSTRAINT PK_Roles PRIMARY KEY CLUSTERED ([RoleID] ASC),
        CONSTRAINT UQ_Roles_RoleName UNIQUE ([RoleName])
    );
    PRINT 'Table [dbo].[Roles] created successfully.';

    -- Seed default roles
    INSERT INTO [dbo].[Roles] (RoleName) VALUES ('Admin');
    INSERT INTO [dbo].[Roles] (RoleName) VALUES ('Manager');
    INSERT INTO [dbo].[Roles] (RoleName) VALUES ('Operator');
    PRINT 'Default roles seeded into [dbo].[Roles].';
END
ELSE
BEGIN
    PRINT 'Table [dbo].[Roles] already exists.';
END
GO
