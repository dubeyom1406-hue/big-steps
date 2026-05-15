// Central API Configuration
// Development: 'http://localhost:5000/api'
// Production:  'https://big-steps.onrender.com/api'
const BASE_URL = import.meta.env.VITE_API_URL || 'https://big-steps.onrender.com/api';

export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('admin_token');
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        });

        // Handle Session Expiry
        if (response.status === 401 || response.status === 403) {
            // localStorage.removeItem('admin_token');
            // window.location.href = '/admin-login';
        }

        return response;
    } catch (error) {
        console.error("API Connectivity Error:", error);
        throw new Error("Unable to connect to backend server. It might be starting up or sleeping, please wait a minute and try again.");
    }
};

export default BASE_URL;
