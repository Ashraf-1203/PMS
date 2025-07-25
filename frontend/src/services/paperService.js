import apiClient from './api';

const getPapers = async (page = 1, limit = 30) => {
  try {
    const response = await apiClient.get(`/papers?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch papers.';
    throw new Error(message);
  }
};

const getPaperById = async (id) => {
  try {
    const response = await apiClient.get(\`/papers/${id}\`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch paper details.';
    throw new Error(message);
  }
};

const createPaper = async (paperData) => {
  try {
    const response = await apiClient.post('/papers', paperData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to create paper.';
    throw new Error(message);
  }
};

const updatePaper = async (id, paperData) => {
  try {
    const response = await apiClient.put(\`/papers/${id}\`, paperData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to update paper.';
    throw new Error(message);
  }
};

const deletePaper = async (id) => {
  try {
    const response = await apiClient.delete(\`/papers/${id}\`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to delete paper.';
    throw new Error(message);
  }
};

const deckleMatch = async (data) => {
  try {
    const response = await apiClient.post('/papers/deckle-match', data);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to perform deckle match.';
    throw new Error(message);
  }
};

const importPapers = async (formData) => {
  try {
    const response = await apiClient.post('/papers/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to import papers.';
    throw new Error(message);
  }
};

const importPapers = async (formData) => {
  try {
    const response = await apiClient.post('/papers/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to import papers.';
    throw new Error(message);
  }
};

const paperService = {
  getPapers,
  getPaperById,
  createPaper,
  updatePaper,
  deletePaper,
  deckleMatch,
  importPapers,
};

export default paperService;
