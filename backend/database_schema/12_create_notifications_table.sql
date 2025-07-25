-- Create Notifications Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Notifications]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Notifications](
        [NotificationID] BIGINT IDENTITY(1,1) NOT NULL,
        [UserID] UNIQUEIDENTIFIER NOT NULL, -- The user who receives the notification
        [Message] NVARCHAR(MAX) NOT NULL,
        [Link] NVARCHAR(255) NULL, -- e.g., '/transfers/approve/some-uuid'
        [IsRead] BIT NOT NULL CONSTRAINT DF_Notifications_IsRead DEFAULT 0,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT DF_Notifications_CreatedAt DEFAULT GETDATE(),

        CONSTRAINT PK_Notifications PRIMARY KEY CLUSTERED ([NotificationID] ASC),
        CONSTRAINT FK_Notifications_UserID FOREIGN KEY ([UserID]) REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE
    );
    PRINT 'Table [dbo].[Notifications] created successfully.';
END
ELSE
BEGIN
    PRINT 'Table [dbo].[Notifications] already exists.';
END
GO
