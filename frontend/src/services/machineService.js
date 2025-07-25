import apiClient from './api';

const getMachines = async () => {
    try {
        const response = await apiClient.get('/machines');
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to fetch machines.';
        throw new Error(message);
    }
};

const createMachine = async (machineData) => {
    try {
        const response = await apiClient.post('/machines', machineData);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to create machine.';
        throw new Error(message);
    }
};

const updateMachine = async (id, machineData) => {
    try {
        const response = await apiClient.put(\`/machines/${id}\`, machineData);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to update machine.';
        throw new Error(message);
    }
};

const deleteMachine = async (id) => {
    try {
        const response = await apiClient.delete(\`/machines/${id}\`);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to delete machine.';
        throw new Error(message);
    }
};

const machineService = {
    getMachines,
    createMachine,
    updateMachine,
    deleteMachine,
};

export default machineService;
