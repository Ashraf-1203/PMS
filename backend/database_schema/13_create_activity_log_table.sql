-- Create ActivityLog Table for non-inventory actions
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ActivityLog]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ActivityLog](
        [LogID] BIGINT IDENTITY(1,1) NOT NULL,
        [UserID] UNIQUEIDENTIFIER NOT NULL,
        [ActionType] NVARCHAR(100) NOT NULL,
        [TargetEntity] NVARCHAR(100) NULL,
        [TargetID] NVARCHAR(300) NULL,
        [Details] NVARCHAR(MAX) NULL, -- Can store JSON with before/after states
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT DF_ActivityLog_CreatedAt DEFAULT GETDATE(),

        CONSTRAINT PK_ActivityLog PRIMARY KEY CLUSTERED ([LogID] ASC),
        CONSTRAINT FK_ActivityLog_UserID FOREIGN KEY ([UserID]) REFERENCES [dbo].[Users]([UserID])
    );
    PRINT 'Table [dbo].[ActivityLog] created successfully.';
END
ELSE
BEGIN
    PRINT 'Table [dbo].[ActivityLog] already exists.';
END
GO
