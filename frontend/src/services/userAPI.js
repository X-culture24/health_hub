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

const userAPI = {
    // Get the current user's settings
    getUserSettings: async () => {
        try {
            const response = await api.get('/settings/');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to fetch user settings');
        }
    },

    // Update the current user's settings
    updateUserSettings: async (settingsData) => {
        try {
            const response = await api.put('/settings/', settingsData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to update user settings');
        }
    },

    // Change user password
    changePassword: async (passwordData) => {
        try {
            const response = await api.post('/change-password/', passwordData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to change password');
        }
    },

    // Get program metrics
    getProgramMetrics: async () => {
        try {
            const response = await api.get('/program-metrics/');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to fetch program metrics');
        }
    },

    // Get resource utilization
    getResourceUtilization: async () => {
        try {
            const response = await api.get('/resource-utilization/');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to fetch resource utilization');
        }
    }
};

export default userAPI; 