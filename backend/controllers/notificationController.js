const db = require('../config/db');

// @desc    Get unread notifications for the current user
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res, next) => {
    const userId = req.user.UserID;
    try {
        const pool = await db.getPool();
        const result = await pool.request()
            .input('UserID', db.sql.UniqueIdentifier, userId)
            .query('SELECT * FROM Notifications WHERE UserID = @UserID AND IsRead = 0 ORDER BY CreatedAt DESC');
        res.status(200).json(result.recordset);
    } catch (error) {
        next(error);
    }
};

// @desc    Mark a notification as read
// @route   POST /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
    const { id: notificationId } = req.params;
    const userId = req.user.UserID;
    try {
        const pool = await db.getPool();
        const result = await pool.request()
            .input('NotificationID', db.sql.BigInt, notificationId)
            .input('UserID', db.sql.UniqueIdentifier, userId) // Ensure user can only mark their own notifications
            .query('UPDATE Notifications SET IsRead = 1 WHERE NotificationID = @NotificationID AND UserID = @UserID');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Notification not found or you do not have permission to mark it as read.' });
        }
        res.status(200).json({ message: 'Notification marked as read.' });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark all notifications as read for the current user
// @route   POST /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
    const userId = req.user.UserID;
    try {
        const pool = await db.getPool();
        await pool.request()
            .input('UserID', db.sql.UniqueIdentifier, userId)
            .query('UPDATE Notifications SET IsRead = 1 WHERE UserID = @UserID');
        res.status(200).json({ message: 'All notifications marked as read.' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
};
