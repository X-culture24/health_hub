import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

// Create an axios instance with default config
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token to all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const clientAPI = {
  getAllClients: async () => {
    try {
      const response = await api.get('/clients/');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch clients');
    }
  },

  searchClients: async (query) => {
    try {
      const response = await api.get(`/clients/search/?q=${query}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to search clients');
    }
  },

  getClientDetails: async (clientId) => {
    try {
      const response = await api.get(`/clients/${clientId}/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch client details');
    }
  },

  getClientComprehensiveInfo: async (clientId) => {
    try {
      const response = await api.get(`/clients/${clientId}/comprehensive/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch client comprehensive info');
    }
  },

  createClient: async (clientData) => {
    try {
      const response = await api.post('/clients/register/', clientData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create client');
    }
  },

  updateClient: async (clientId, clientData) => {
    try {
      const response = await api.put(`/clients/${clientId}/`, clientData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update client');
    }
  },

  deleteClient: async (clientId) => {
    try {
      await api.delete(`/clients/${clientId}/delete/`);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete client');
    }
  }
};

export default clientAPI; 