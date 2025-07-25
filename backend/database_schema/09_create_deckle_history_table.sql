-- Create DeckleHistory Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[DeckleHistory]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[DeckleHistory](
        [DeckleID] BIGINT IDENTITY(1,1) NOT NULL,
        [SourcePaperID] UNIQUEIDENTIFIER NOT NULL,
        [SourceWidth] DECIMAL(10, 2) NOT NULL,
        [CutWidth] DECIMAL(10, 2) NOT NULL,
        [ResultingWidth1] DECIMAL(10, 2) NOT NULL,
        [ResultingWidth2] DECIMAL(10, 2) NOT NULL,
        [TargetPaperID1] UNIQUEIDENTIFIER NOT NULL,
        [TargetPaperID2] UNIQUEIDENTIFIER NOT NULL,
        [QuantityRM] DECIMAL(18, 2) NOT NULL,
        [PerformedBy] UNIQUEIDENTIFIER NOT NULL,
        [PerformedAt] DATETIME2 NOT NULL CONSTRAINT DF_DeckleHistory_PerformedAt DEFAULT GETDATE(),

        CONSTRAINT PK_DeckleHistory PRIMARY KEY CLUSTERED ([DeckleID] ASC),
        CONSTRAINT FK_DeckleHistory_SourcePaper FOREIGN KEY ([SourcePaperID]) REFERENCES [dbo].[Papers]([PaperID]),
        CONSTRAINT FK_DeckleHistory_TargetPaper1 FOREIGN KEY ([TargetPaperID1]) REFERENCES [dbo].[Papers]([PaperID]),
        CONSTRAINT FK_DeckleHistory_TargetPaper2 FOREIGN KEY ([TargetPaperID2]) REFERENCES [dbo].[Papers]([PaperID]),
        CONSTRAINT FK_DeckleHistory_PerformedBy FOREIGN KEY ([PerformedBy]) REFERENCES [dbo].[Users]([UserID])
    );
    PRINT 'Table [dbo].[DeckleHistory] created successfully.';
END
ELSE
BEGIN
    PRINT 'Table [dbo].[DeckleHistory] already exists.';
END
GO
