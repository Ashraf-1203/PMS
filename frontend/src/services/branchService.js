import apiClient from './api';

// Gets all branches, including inactive ones, for the management page
const getAllBranchesForAdmin = async () => {
    try {
        // Assuming the same endpoint can be used, or a new one could be created
        // For now, we use the same and filter on the frontend if needed.
        const response = await apiClient.get('/branches');
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to fetch branches.';
        throw new Error(message);
    }
};

// Gets only active branches, for use in dropdowns etc.
const getActiveBranches = async () => {
    try {
        const response = await apiClient.get('/branches');
        // Filter for active branches on the client side
        return response.data.filter(b => b.IsActive);
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to fetch active branches.';
        throw new Error(message);
    }
};


const createBranch = async (branchData) => {
    try {
        const response = await apiClient.post('/branches', branchData);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to create branch.';
        throw new Error(message);
    }
};

const updateBranch = async (id, branchData) => {
    try {
        const response = await apiClient.put(\`/branches/${id}\`, branchData);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to update branch.';
        throw new Error(message);
    }
};

const deleteBranch = async (id) => {
    try {
        const response = await apiClient.delete(\`/branches/${id}\`);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to delete branch.';
        throw new Error(message);
    }
};


const branchService = {
    getAllBranchesForAdmin,
    getActiveBranches,
    createBranch,
    updateBranch,
    deleteBranch,
};

export default branchService;
