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

// Authentication endpoints
export const auth = {
    login: (credentials) => api.post('/auth/token/', credentials),
    register: (data) => api.post('/auth/register/', data),
};

// Client endpoints
export const clients = {
    list: () => api.get('/clients/'),
    create: (data) => api.post('/clients/register/', data),
    getById: (id) => api.get(`/clients/${id}/`),
    update: (id, data) => api.put(`/clients/${id}/`, data),
    delete: (id) => api.delete(`/clients/${id}/delete/`),
    search: (query) => api.get(`/clients/search/?q=${query}`),
    getComprehensiveInfo: (id) => api.get(`/clients/${id}/comprehensive/`),
    getComprehensiveInfoByName: (firstName, lastName) => api.get(`/clients/by-name/${firstName}/${lastName}/comprehensive/`),
};

// Program endpoints
export const programs = {
    list: () => api.get('/programs/'),
    create: (data) => api.post('/programs/create/', data),
    getById: (id) => api.get(`/programs/${id}/`),
    update: (id, data) => api.put(`/programs/${id}/`, data),
    delete: (id) => api.delete(`/programs/${id}/delete/`),
};

// Enrollment endpoints
export const enrollments = {
    create: (data) => api.post('/enrollments/create/', data),
    list: () => api.get('/enrollments/'),
    getById: (id) => api.get(`/enrollments/${id}/`),
    update: (id, data) => api.put(`/enrollments/${id}/`, data),
    delete: (id) => api.delete(`/enrollments/${id}/delete/`),
};

// Prescription endpoints
export const prescriptions = {
    create: (data) => api.post('/prescriptions/create/', data),
    list: () => api.get('/prescriptions/'),
    getById: (id) => api.get(`/prescriptions/${id}/`),
    update: (id, data) => api.put(`/prescriptions/${id}/`, data),
    delete: (id) => api.delete(`/prescriptions/${id}/delete/`),
};

// Metrics endpoints
export const metrics = {
    list: () => api.get('/metrics/'),
    detail: (id) => api.get(`/metrics/${id}/`),
    record: (data) => api.post('/metrics/record/', data),
    delete: (id) => api.delete(`/metrics/${id}/delete/`),
};

// Appointment endpoints
export const appointments = {
    create: (data) => api.post('/appointments/create/', data),
    list: () => api.get('/appointments/'),
    getById: (id) => api.get(`/appointments/${id}/`),
    update: (id, data) => api.put(`/appointments/${id}/`, data),
    delete: (id) => api.delete(`/appointments/${id}/delete/`),
};

// Report endpoints
export const reports = {
    generate: (params) => api.get('/reports/', { params }),
};

// Settings endpoints
export const settings = {
    get: () => api.get('/settings/'),
    update: (data) => api.put('/settings/', data),
    changePassword: (data) => api.post('/change-password/', data),
};

// Program metrics endpoint
export const programMetrics = {
    get: () => api.get('/program-metrics/'),
};

// Resource utilization endpoint
export const resources = {
    getUtilization: () => api.get('/resource-utilization/'),
};

// Staff endpoints
export const staff = {
    list: () => api.get('/staff/'),
};

export default api; 