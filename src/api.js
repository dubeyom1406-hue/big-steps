// Central API Configuration
const BASE_URL = 'http://127.0.0.1:5000/api';

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
        throw new Error("Unable to connect to backend. Please check if server is running on port 5000.");
    }
};

export default BASE_URL;
