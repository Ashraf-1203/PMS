import apiClient from './api';

const initiateTransfer = async (data) => {
    try {
        const response = await apiClient.post('/transfers/initiate', data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to initiate transfer.');
    }
};

const getPendingTransfers = async () => {
    try {
        const response = await apiClient.get('/transfers/pending');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch pending transfers.');
    }
};

const approveTransfer = async (transferId) => {
    try {
        const response = await apiClient.post(\`/transfers/${transferId}/approve\`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to approve transfer.');
    }
};

const transferService = {
    initiateTransfer,
    getPendingTransfers,
    approveTransfer,
};

export default transferService;
