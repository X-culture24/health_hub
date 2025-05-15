import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

const authAPI = {
    login: async (credentials) => {
        try {
            console.log('Attempting login with:', { ...credentials, password: '[REDACTED]' });
            const response = await axios.post(`${BASE_URL}/auth/token/`, credentials);
            console.log('Login response:', response.data);
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                // Store user info
                const userData = {
                    id: response.data.user_id,
                    username: response.data.username,
                    is_doctor: response.data.is_doctor,
                    is_nurse: response.data.is_nurse
                };
                console.log('Storing user data:', userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return { success: true };
            }
            console.error('No token in response:', response.data);
            return { 
                success: false, 
                error: 'Invalid response from server' 
            };
        } catch (error) {
            console.error('Login error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            if (error.response?.status === 400) {
                return { 
                    success: false, 
                    error: 'Invalid username or password'
                };
            }
            return { 
                success: false, 
                error: 'Failed to login. Please try again.'
            };
        }
    },

    register: async (userData) => {
        try {
            const response = await axios.post(`${BASE_URL}/auth/register/`, {
                username: userData.username,
                password: userData.password,
                work_email: userData.work_email,
                employer_id: userData.employer_id,
                is_doctor: userData.is_doctor,
                is_nurse: userData.is_nurse
            });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify({
                    id: response.data.user.id,
                    username: response.data.user.username,
                    is_doctor: response.data.user.is_doctor,
                    is_nurse: response.data.user.is_nurse
                }));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: 'Failed to register' };
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isDoctor: () => {
        const user = authAPI.getUser();
        return user ? user.is_doctor : false;
    },

    isNurse: () => {
        const user = authAPI.getUser();
        return user ? user.is_nurse : false;
    },

    isMedicalStaff: () => {
        return authAPI.isDoctor() || authAPI.isNurse();
    }
};

export default authAPI; 