import apiClient from './api';

const receivePaper = async (data) => {
    try {
        const response = await apiClient.post('/inventory/receive', data);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to receive paper.';
        throw new Error(message);
    }
};

const consumePaper = async (data) => {
    try {
        const response = await apiClient.post('/inventory/consume', data);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to consume paper.';
        throw new Error(message);
    }
};

const issuePaper = async (data) => {
    try {
        const response = await apiClient.post('/inventory/issue', data);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to issue paper.';
        throw new Error(message);
    }
};

const returnPaper = async (data) => {
    try {
        const response = await apiClient.post('/inventory/return', data);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to return paper.';
        throw new Error(message);
    }
};

const calculateReturnRm = async (data) => {
    try {
        const response = await apiClient.post('/inventory/calculate-return-rm', data);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to calculate RM.';
        throw new Error(message);
    }
};

const adjustStock = async (data) => {
    try {
        const response = await apiClient.post('/inventory/adjust', data);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to adjust stock.';
        throw new Error(message);
    }
};

const rejectPaper = async (data) => {
    try {
        const response = await apiClient.post('/inventory/reject', data);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to reject paper.';
        throw new Error(message);
    }
};

const inventoryService = {
    receivePaper,
    consumePaper,
    issuePaper,
    returnPaper,
    calculateReturnRm,
    adjustStock,
    rejectPaper,
};

export default inventoryService;
