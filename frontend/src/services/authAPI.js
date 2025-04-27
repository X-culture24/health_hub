import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

const authAPI = {
    login: async (credentials) => {
        try {
            const response = await axios.post(`${BASE_URL}/auth/token/`, credentials);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                // Optionally store user info if returned by backend
                if (response.data.user_id || response.data.username) {
                    localStorage.setItem('user', JSON.stringify({
                        id: response.data.user_id,
                        username: response.data.username,
                        is_doctor: response.data.is_doctor,
                        is_nurse: response.data.is_nurse
                    }));
                }
            }
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error.response?.data || { error: 'Failed to login. Please check your credentials.' };
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