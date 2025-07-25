-- Seed Default Admin User
-- This script should be run AFTER 01_create_roles_table.sql and 02_create_users_table.sql

DECLARE @AdminRoleID INT;
DECLARE @AdminUsername NVARCHAR(255) = 'admin';
DECLARE @AdminPasswordHash NVARCHAR(MAX) = '$2a$10$3n1.jGUaPV8xlyeDOP9nJ.1Y7M83kXlwN8uL2ZVPVnTMxh218Ggqu'; -- Hash for 'admin123'
DECLARE @AdminFullName NVARCHAR(255) = 'System Administrator';
DECLARE @AdminEmail NVARCHAR(255) = 'admin@pms.local'; -- Placeholder email

BEGIN
    -- Check if the Admin role exists
    SELECT @AdminRoleID = RoleID FROM dbo.Roles WHERE RoleName = 'Admin';

    IF @AdminRoleID IS NULL
    BEGIN
        PRINT 'Error: Admin role not found. Cannot seed admin user.';
        RETURN;
    END

    -- Check if the admin user already exists
    IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Username = @AdminUsername)
    BEGIN
        BEGIN TRY
            INSERT INTO dbo.Users (UserID, Username, PasswordHash, FullName, Email, RoleID, IsActive, CreatedAt, UpdatedAt)
            VALUES (
                NEWID(),            -- UserID
                @AdminUsername,     -- Username
                @AdminPasswordHash, -- PasswordHash for 'admin123'
                @AdminFullName,     -- FullName
                @AdminEmail,        -- Email
                @AdminRoleID,       -- RoleID
                1,                  -- IsActive
                GETDATE(),          -- CreatedAt
                GETDATE()           -- UpdatedAt
            );
            PRINT 'Default admin user (admin/admin123) seeded successfully.';
        END TRY
        BEGIN CATCH
            PRINT 'Error seeding admin user: ' + ERROR_MESSAGE();
        END CATCH
    END
    ELSE
    BEGIN
        PRINT 'Admin user ''' + @AdminUsername + ''' already exists.';
        -- Optionally, update the password if it needs to be reset to 'admin123'
        -- For security, this should be a deliberate action, not automatic.
        -- UPDATE dbo.Users
        -- SET PasswordHash = @AdminPasswordHash, UpdatedAt = GETDATE()
        -- WHERE Username = @AdminUsername AND RoleID = @AdminRoleID;
        -- PRINT 'Admin user (admin) password hash updated to match "admin123".';
    END
END
GO

-- After creating the admin user, grant this admin user all permissions.
-- This is a simplified approach for initial setup.
-- In a real application, permissions would be managed more granularly, possibly through a UI.

DECLARE @AdminUserID UNIQUEIDENTIFIER;
DECLARE @AdminRoleID_Perm INT;

SELECT @AdminUserID = UserID FROM dbo.Users WHERE Username = 'admin';
SELECT @AdminRoleID_Perm = RoleID FROM dbo.Roles WHERE RoleName = 'Admin';

IF @AdminUserID IS NOT NULL AND @AdminRoleID_Perm IS NOT NULL
BEGIN
    PRINT 'Granting all permissions to Admin role (RoleID: ' + CAST(@AdminRoleID_Perm AS NVARCHAR(10)) + ')';

    -- Clear existing permissions for Admin to avoid issues if script is re-run
    -- DELETE FROM dbo.Permissions WHERE RoleID = @AdminRoleID_Perm;
    -- PRINT 'Cleared existing permissions for Admin role.';

    INSERT INTO dbo.Permissions (RoleID, PageID, ActionID, IsEnabled, CreatedAt, UpdatedAt)
    SELECT
        @AdminRoleID_Perm,
        p.PageID,
        a.ActionID,
        1, -- IsEnabled
        GETDATE(),
        GETDATE()
    FROM dbo.Pages p
    CROSS JOIN dbo.Actions a
    WHERE NOT EXISTS ( -- Avoid inserting duplicate permissions
        SELECT 1
        FROM dbo.Permissions existing
        WHERE existing.RoleID = @AdminRoleID_Perm
          AND existing.PageID = p.PageID
          AND existing.ActionID = a.ActionID
    );

    PRINT 'All available page-action permissions granted to the Admin role.';
END
ELSE
BEGIN
    PRINT 'Admin user or Admin role not found, could not grant permissions.';
END
GO
