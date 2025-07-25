import apiClient from './api';

const getStockReport = async (filters) => {
    try {
        const response = await apiClient.get('/reports/stock', { params: filters });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch stock report.');
    }
};

// TODO: Add other report service functions

const getTransactionReport = async (transactionType, filters) => {
    try {
        const response = await apiClient.get(`/reports/transactions/${transactionType}`, { params: filters });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || `Failed to fetch ${transactionType} report.`);
    }
};

const reportService = {
    getStockReport,
    getTransactionReport,
};

export default reportService;
