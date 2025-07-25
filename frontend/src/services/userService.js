import apiClient from './api';

const getUsers = async () => {
    try {
        const response = await apiClient.get('/users');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch users.');
    }
};

const updateUser = async (id, userData) => {
    try {
        const response = await apiClient.put(\`/users/${id}\`, userData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update user.');
    }
};

const getRoles = async () => {
    try {
        const response = await apiClient.get('/users/roles');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch roles.');
    }
};

const userService = {
    getUsers,
    updateUser,
    getRoles,
};

export default userService;
