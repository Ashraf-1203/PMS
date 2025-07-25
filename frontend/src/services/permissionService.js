import apiClient from './api';

const getPermissions = async () => {
    try {
        const response = await apiClient.get('/permissions');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch permissions.');
    }
};

const getPermissionMatrix = async () => {
    try {
        const response = await apiClient.get('/permissions/matrix');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch permission matrix.');
    }
};

const updatePermissions = async (roleId, permissions) => {
    try {
        const response = await apiClient.post(\`/permissions/${roleId}\`, { permissions });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update permissions.');
    }
};

const permissionService = {
    getPermissions,
    getPermissionMatrix,
    updatePermissions,
};

export default permissionService;
