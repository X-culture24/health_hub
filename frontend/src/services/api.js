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
    create: (data) => api.post('/staff/', data),
    getById: (id) => api.get(`/staff/${id}/`),
    update: (id, data) => api.put(`/staff/${id}/`, data),
    delete: (id) => api.delete(`/staff/${id}/`),
};

// Kenya Health System - New API Endpoints

// Health Facilities
export const facilities = {
    list: () => api.get('/facilities/'),
    create: (data) => api.post('/facilities/', data),
    getById: (id) => api.get(`/facilities/${id}/`),
    update: (id, data) => api.put(`/facilities/${id}/`, data),
    delete: (id) => api.delete(`/facilities/${id}/`),
    getServices: (id) => api.get(`/facilities/${id}/services/`),
    getDepartments: (id) => api.get(`/facilities/${id}/departments/`),
};

// Departments
export const departments = {
    list: () => api.get('/departments/'),
    create: (data) => api.post('/departments/', data),
    getById: (id) => api.get(`/departments/${id}/`),
    update: (id, data) => api.put(`/departments/${id}/`, data),
    delete: (id) => api.delete(`/departments/${id}/`),
    getStaff: (id) => api.get(`/departments/${id}/staff/`),
};

// Medical Specialties
export const specialties = {
    list: () => api.get('/specialties/'),
    create: (data) => api.post('/specialties/', data),
    getById: (id) => api.get(`/specialties/${id}/`),
    update: (id, data) => api.put(`/specialties/${id}/`, data),
    delete: (id) => api.delete(`/specialties/${id}/`),
};

// Doctor Availability
export const doctorAvailability = {
    list: () => api.get('/doctor-availability/'),
    create: (data) => api.post('/doctor-availability/', data),
    getById: (id) => api.get(`/doctor-availability/${id}/`),
    update: (id, data) => api.put(`/doctor-availability/${id}/`, data),
    delete: (id) => api.delete(`/doctor-availability/${id}/`),
    getByDoctor: (doctorId) => api.get(`/doctor-availability/?doctor=${doctorId}`),
    getByFacility: (facilityId) => api.get(`/doctor-availability/?facility=${facilityId}`),
};

// Shift Booking
export const shiftBookings = {
    list: () => api.get('/shift-bookings/'),
    create: (data) => api.post('/shift-bookings/', data),
    getById: (id) => api.get(`/shift-bookings/${id}/`),
    update: (id, data) => api.put(`/shift-bookings/${id}/`, data),
    delete: (id) => api.delete(`/shift-bookings/${id}/`),
    confirm: (id) => api.post(`/shift-bookings/${id}/confirm/`),
    cancel: (id) => api.post(`/shift-bookings/${id}/cancel/`),
    complete: (id) => api.post(`/shift-bookings/${id}/complete/`),
};

// Surgery Management
export const surgeries = {
    list: () => api.get('/surgery-schedules/'),
    create: (data) => api.post('/surgery-schedules/', data),
    getById: (id) => api.get(`/surgery-schedules/${id}/`),
    update: (id, data) => api.put(`/surgery-schedules/${id}/`, data),
    delete: (id) => api.delete(`/surgery-schedules/${id}/`),
    getTypes: () => api.get('/surgery-types/'),
    getOperatingRooms: () => api.get('/operating-rooms/'),
    checkAvailability: (params) => api.get('/surgery-schedules/availability/', { params }),
};

// Virtual Pharmacist
export const virtualPharmacist = {
    consult: (data) => api.post('/virtual-pharmacist/consult/', data),
    getHistory: (patientId) => api.get(`/virtual-pharmacist/history/${patientId}/`),
    checkInteractions: (data) => api.post('/virtual-pharmacist/check-interactions/', data),
};

// Pharmacy Inventory
export const pharmacy = {
    inventory: () => api.get('/pharmacy-inventory/'),
    updateStock: (id, data) => api.put(`/pharmacy-inventory/${id}/`, data),
    addDrug: (data) => api.post('/pharmacy-inventory/', data),
    getLowStock: () => api.get('/pharmacy-inventory/low-stock/'),
    getExpiringSoon: () => api.get('/pharmacy-inventory/expiring-soon/'),
    getDrugs: () => api.get('/drugs/'),
    createDrug: (data) => api.post('/drugs/', data),
    getCategories: () => api.get('/drug-categories/'),
    getManufacturers: () => api.get('/drug-manufacturers/'),
};

// Payment Management
export const payments = {
    list: () => api.get('/payments/'),
    create: (data) => api.post('/payments/', data),
    getById: (id) => api.get(`/payments/${id}/`),
    update: (id, data) => api.put(`/payments/${id}/`, data),
    processPayment: (data) => api.post('/payments/process/', data),
    getMethods: () => api.get('/payment-methods/'),
    getByPatient: (patientId) => api.get(`/payments/?patient=${patientId}`),
};

// Patient Insurance
export const insurance = {
    list: () => api.get('/patient-insurance/'),
    create: (data) => api.post('/patient-insurance/', data),
    getById: (id) => api.get(`/patient-insurance/${id}/`),
    update: (id, data) => api.put(`/patient-insurance/${id}/`, data),
    delete: (id) => api.delete(`/patient-insurance/${id}/`),
    verify: (id) => api.post(`/patient-insurance/${id}/verify/`),
};

// Medical History
export const medicalHistory = {
    list: () => api.get('/medical-history/'),
    create: (data) => api.post('/medical-history/', data),
    getById: (id) => api.get(`/medical-history/${id}/`),
    update: (id, data) => api.put(`/medical-history/${id}/`, data),
    delete: (id) => api.delete(`/medical-history/${id}/`),
    getByPatient: (patientId) => api.get(`/medical-history/?patient=${patientId}`),
};

// Telemedicine
export const telemedicine = {
    sessions: () => api.get('/telemedicine-sessions/'),
    createSession: (data) => api.post('/telemedicine-sessions/', data),
    getSession: (id) => api.get(`/telemedicine-sessions/${id}/`),
    updateSession: (id, data) => api.put(`/telemedicine-sessions/${id}/`, data),
    endSession: (id) => api.post(`/telemedicine-sessions/${id}/end/`),
};

// Dashboard Analytics
export const analytics = {
    dashboard: () => api.get('/dashboard/'),
    facilityStats: (facilityId) => api.get(`/dashboard/facility/${facilityId}/`),
    appointmentStats: () => api.get('/dashboard/appointments/'),
    pharmacyStats: () => api.get('/dashboard/pharmacy/'),
    financialStats: () => api.get('/dashboard/financial/'),
};

// System Configuration
export const systemConfig = {
    list: () => api.get('/system-config/'),
    update: (key, data) => api.put(`/system-config/${key}/`, data),
    create: (data) => api.post('/system-config/', data),
};

// Audit Logs
export const auditLogs = {
    list: (params) => api.get('/audit-logs/', { params }),
    getById: (id) => api.get(`/audit-logs/${id}/`),
};

export default api;