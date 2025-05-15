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

const prescriptionAPI = {
  createPrescription: async (data) => {
    try {
      const response = await api.post('/prescriptions/create/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPrescriptions: async () => {
    try {
      const response = await api.get('/prescriptions/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPrescription: async (id) => {
    try {
      const response = await api.get(`/prescriptions/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updatePrescription: async (id, data) => {
    try {
      const response = await api.put(`/prescriptions/${id}/update/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default prescriptionAPI; 