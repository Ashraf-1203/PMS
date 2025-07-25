import apiClient from './api';

const getMyNotifications = async () => {
    try {
        const response = await apiClient.get('/notifications');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch notifications.');
    }
};

const markAsRead = async (notificationId) => {
    try {
        const response = await apiClient.post(\`/notifications/${notificationId}/read\`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to mark notification as read.');
    }
};

const markAllAsRead = async () => {
    try {
        const response = await apiClient.post('/notifications/read-all');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read.');
    }
};

const notificationService = {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
};

export default notificationService;
