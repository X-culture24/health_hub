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

const reportAPI = {
  getReportTypes: () => {
    return Promise.resolve([
      { value: 'client_attendance', label: 'Client Attendance' },
      { value: 'program_enrollment', label: 'Program Enrollment' },
      { value: 'prescription_usage', label: 'Prescription Usage' },
      { value: 'revenue_analysis', label: 'Revenue Analysis' },
      { value: 'staff_performance', label: 'Staff Performance' }
    ]);
  },

  generateReport: (reportType, startDate, endDate) => {
    return api.get('/reports/', {
      params: {
        type: reportType,
        start_date: startDate,
        end_date: endDate
      }
    });
  },

  downloadReport: (reportId, format = 'pdf') => {
    return api.get(`/reports/download/${reportId}/?format=${format}`, {
      responseType: 'blob'
    });
  }
};

export default reportAPI; 