import apiClient from './api';

const getActivityLog = async (page = 1, limit = 30) => {
    try {
        const response = await apiClient.get(`/activity-log?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch activity log.');
    }
};

const getHistoryForTarget = async (targetEntity, targetId) => {
    try {
        const response = await apiClient.get(`/activity-log/history/${targetEntity}/${targetId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch history.');
    }
};

const activityLogService = {
    getActivityLog,
    getHistoryForTarget,
};

export default activityLogService;
