-- Create Pages Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Pages]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Pages](
        [PageID] INT IDENTITY(1,1) NOT NULL,
        [PageName] NVARCHAR(100) NOT NULL, -- Unique human-readable name
        [PageKey] NVARCHAR(100) NOT NULL, -- Unique key for programmatic access (e.g., 'userManagement', 'paperReceiving')
        [PagePath] NVARCHAR(255) NULL,    -- Associated frontend route path, can be null for abstract pages/features
        [Description] NVARCHAR(255) NULL,
        [Module] NVARCHAR(100) NULL, -- To group pages, e.g., 'Inventory', 'Administration'
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT DF_Pages_CreatedAt DEFAULT GETDATE(),
        [UpdatedAt] DATETIME2 NOT NULL CONSTRAINT DF_Pages_UpdatedAt DEFAULT GETDATE(),
        CONSTRAINT PK_Pages PRIMARY KEY CLUSTERED ([PageID] ASC),
        CONSTRAINT UQ_Pages_PageName UNIQUE ([PageName]),
        CONSTRAINT UQ_Pages_PageKey UNIQUE ([PageKey])
    );
    PRINT 'Table [dbo].[Pages] created successfully.';
END
ELSE
BEGIN
    PRINT 'Table [dbo].[Pages] already exists.';
END
GO

-- Create Actions Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Actions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Actions](
        [ActionID] INT IDENTITY(1,1) NOT NULL,
        [ActionName] NVARCHAR(50) NOT NULL, -- e.g., View, Add, Edit, Delete, Print, Approve
        [ActionKey] NVARCHAR(50) NOT NULL,  -- e.g., 'view', 'add', 'edit', 'delete', 'print', 'approve'
        [Description] NVARCHAR(255) NULL,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT DF_Actions_CreatedAt DEFAULT GETDATE(),
        [UpdatedAt] DATETIME2 NOT NULL CONSTRAINT DF_Actions_UpdatedAt DEFAULT GETDATE(),
        CONSTRAINT PK_Actions PRIMARY KEY CLUSTERED ([ActionID] ASC),
        CONSTRAINT UQ_Actions_ActionName UNIQUE ([ActionName]),
        CONSTRAINT UQ_Actions_ActionKey UNIQUE ([ActionKey])
    );
    PRINT 'Table [dbo].[Actions] created successfully.';

    -- Seed common actions
    INSERT INTO [dbo].[Actions] (ActionName, ActionKey, Description) VALUES
    ('View', 'view', 'Permission to view data or a page'),
    ('Add', 'add', 'Permission to add new data'),
    ('Edit', 'edit', 'Permission to edit existing data'),
    ('Delete', 'delete', 'Permission to delete data'),
    ('Print', 'print', 'Permission to print reports or documents'),
    ('Export', 'export', 'Permission to export data'),
    ('Approve', 'approve', 'Permission to approve requests or actions'),
    ('Manage Permissions', 'manage_permissions', 'Permission to manage user/role permissions');
    PRINT 'Common actions seeded into [dbo].[Actions].';
END
ELSE
BEGIN
    PRINT 'Table [dbo].[Actions] already exists.';
END
GO

-- Create Permissions Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Permissions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Permissions](
        [PermissionID] INT IDENTITY(1,1) NOT NULL,
        [RoleID] INT NOT NULL,
        [PageID] INT NOT NULL,
        [ActionID] INT NOT NULL,
        [IsEnabled] BIT NOT NULL CONSTRAINT DF_Permissions_IsEnabled DEFAULT 1,
        [CreatedAt] DATETIME2 NOT NULL CONSTRAINT DF_Permissions_CreatedAt DEFAULT GETDATE(),
        [UpdatedAt] DATETIME2 NOT NULL CONSTRAINT DF_Permissions_UpdatedAt DEFAULT GETDATE(),
        CONSTRAINT PK_Permissions PRIMARY KEY CLUSTERED ([PermissionID] ASC),
        CONSTRAINT FK_Permissions_RoleID FOREIGN KEY ([RoleID]) REFERENCES [dbo].[Roles]([RoleID]) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT FK_Permissions_PageID FOREIGN KEY ([PageID]) REFERENCES [dbo].[Pages]([PageID]) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT FK_Permissions_ActionID FOREIGN KEY ([ActionID]) REFERENCES [dbo].[Actions]([ActionID]) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT UQ_Permissions_RolePageAction UNIQUE ([RoleID], [PageID], [ActionID])
    );
    PRINT 'Table [dbo].[Permissions] created successfully.';
END
ELSE
BEGIN
    PRINT 'Table [dbo].[Permissions] already exists.';
END
GO

-- Triggers for UpdatedAt on Pages, Actions, Permissions
IF OBJECT_ID ('dbo.trg_Pages_UpdateUpdatedAt', 'TR') IS NOT NULL DROP TRIGGER dbo.trg_Pages_UpdateUpdatedAt;
GO
CREATE TRIGGER trg_Pages_UpdateUpdatedAt ON dbo.Pages AFTER UPDATE AS BEGIN UPDATE dbo.Pages SET UpdatedAt = GETDATE() FROM dbo.Pages t INNER JOIN inserted i ON t.PageID = i.PageID; END;
GO
PRINT 'Trigger trg_Pages_UpdateUpdatedAt for Pages table created/updated.';
GO

IF OBJECT_ID ('dbo.trg_Actions_UpdateUpdatedAt', 'TR') IS NOT NULL DROP TRIGGER dbo.trg_Actions_UpdateUpdatedAt;
GO
CREATE TRIGGER trg_Actions_UpdateUpdatedAt ON dbo.Actions AFTER UPDATE AS BEGIN UPDATE dbo.Actions SET UpdatedAt = GETDATE() FROM dbo.Actions t INNER JOIN inserted i ON t.ActionID = i.ActionID; END;
GO
PRINT 'Trigger trg_Actions_UpdateUpdatedAt for Actions table created/updated.';
GO

IF OBJECT_ID ('dbo.trg_Permissions_UpdateUpdatedAt', 'TR') IS NOT NULL DROP TRIGGER dbo.trg_Permissions_UpdateUpdatedAt;
GO
CREATE TRIGGER trg_Permissions_UpdateUpdatedAt ON dbo.Permissions AFTER UPDATE AS BEGIN UPDATE dbo.Permissions SET UpdatedAt = GETDATE() FROM dbo.Permissions t INNER JOIN inserted i ON t.PermissionID = i.PermissionID; END;
GO
PRINT 'Trigger trg_Permissions_UpdateUpdatedAt for Permissions table created/updated.';
GO

-- Seed some example Pages (based on sidebar structure in prompt)
-- This should align with frontend routes and backend resource protection.
MERGE INTO Pages AS Target
USING (VALUES
    ('Dashboard', 'dashboard', '/dashboard', 'Main dashboard overview', 'General'),
    ('Consume Paper', 'consumePaper', '/inventory/consume', 'Consume paper from stock', 'Inventory'),
    ('Receive Paper', 'receivePaper', '/inventory/receive', 'Receive new paper into stock', 'Inventory'),
    ('Reject Paper', 'rejectPaper', '/inventory/reject', 'Reject paper from stock', 'Inventory'),
    ('Transfer Paper', 'transferPaper', '/inventory/transfer', 'Transfer paper between locations/branches', 'Inventory'),
    ('Issued Paper List', 'issuedPaperList', '/inventory/issued', 'List of issued papers', 'Inventory'), -- Changed from "Issued Paper" to be more specific if it's a list view
    ('Returned Paper List', 'returnedPaperList', '/inventory/returned', 'List of returned papers', 'Inventory'), -- Changed from "Returned Paper"
    ('Add Paper Master', 'addPaperMaster', '/papers/add', 'Add new paper master data', 'Papers'),
    ('Papers Master List', 'papersMasterList', '/papers/list', 'View and manage paper master data', 'Papers'),
    ('Rate Management', 'rateManagement', '/papers/rates', 'Manage paper rates', 'Papers'),
    ('Paper Adjustment', 'paperAdjustment', '/papers/adjustment', 'Manually adjust paper stock', 'Papers'),
    ('Machine Entry', 'machineEntry', '/papers/machines', 'Manage machines', 'Papers'),
    ('Deckle Match', 'deckleMatch', '/papers/deckle-match', 'Perform deckle matching', 'Papers'),
    ('Branch List', 'branchList', '/branches/list', 'Manage branches', 'BranchManagement'),
    ('Stock Report', 'stockReport', '/reports/stock', 'View stock report', 'Reports'),
    ('Issued Report', 'issuedReport', '/reports/issued', 'View issued paper report', 'Reports'),
    ('Returned Report', 'returnedReport', '/reports/returned', 'View returned paper report', 'Reports'),
    ('Transfer Report', 'transferReport', '/reports/transfer', 'View transfer paper report', 'Reports'),
    ('Rejected Report', 'rejectedReport', '/reports/rejected', 'View rejected paper report', 'Reports'),
    ('Consumed Report', 'consumedReport', '/reports/consumed', 'View consumed paper report', 'Reports'),
    ('Receive Report', 'receiveReport', '/reports/receive', 'View received paper report', 'Reports'),
    ('Activity Log', 'activityLog', '/reports/activity-log', 'View system activity log', 'Reports'),
    ('User Management', 'userManagement', '/admin/users', 'Manage users', 'Administration'),
    ('Permission Management', 'permissionManagement', '/admin/permissions', 'Manage role permissions', 'Administration'),
    ('System History', 'systemHistory', '/admin/history', 'View system history (general)', 'Administration') -- "History" from prompt, clarified scope
) AS Source (PageName, PageKey, PagePath, Description, Module)
ON Target.PageKey = Source.PageKey
WHEN NOT MATCHED BY TARGET THEN
    INSERT (PageName, PageKey, PagePath, Description, Module)
    VALUES (Source.PageName, Source.PageKey, Source.PagePath, Source.Description, Source.Module)
WHEN MATCHED THEN
    UPDATE SET
        Target.PageName = Source.PageName,
        Target.PagePath = Source.PagePath,
        Target.Description = Source.Description,
        Target.Module = Source.Module;

PRINT 'Pages seeded/updated in [dbo].[Pages].';
GO

-- Example: Grant Admin all permissions to all seeded pages and actions
-- This is a broad grant; more granular permissions would typically be set.
-- This script assumes 'Admin' role (RoleID=1 typically) and all actions/pages exist.
-- It's better to run this after all data is seeded.
-- For now, this is a placeholder concept. A dedicated script or UI will manage this.
-- INSERT INTO Permissions (RoleID, PageID, ActionID, IsEnabled)
-- SELECT
--     r.RoleID,
--     p.PageID,
--     a.ActionID,
--     1 -- IsEnabled
-- FROM Roles r
-- CROSS JOIN Pages p
-- CROSS JOIN Actions a
-- WHERE r.RoleName = 'Admin'
-- AND NOT EXISTS ( -- Avoid duplicates if script is run multiple times
--     SELECT 1 FROM Permissions existing_perm
--     WHERE existing_perm.RoleID = r.RoleID
--     AND existing_perm.PageID = p.PageID
--     AND existing_perm.ActionID = a.ActionID
-- );
-- PRINT 'Placeholder: Attempted to grant full permissions to Admin role. Review and refine this logic.';
-- GO
