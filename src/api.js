// Central API Configuration
// Development: 'http://localhost:5000/api'
// Production:  'https://big-steps.onrender.com/api'
const BASE_URL = import.meta.env.VITE_API_URL || 'https://big-steps.onrender.com/api';

export const apiFetch = async (endpoint, options = {}) => {
    const adminToken = localStorage.getItem('admin_token');
    const userToken = localStorage.getItem('user_token');
    const token = adminToken || userToken;
    
    const isFormData = options.body instanceof FormData;
    
    const defaultHeaders = {
        ...(token && { 'Authorization': `Bearer ${token}` })
    };

    // Only add JSON Content-Type if NOT sending FormData
    if (!isFormData) {
        defaultHeaders['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        });

        if (response.status === 401 || response.status === 403) {
            // Optional: handle session expiry logic here
        }

        return response;
    } catch (error) {
        console.error("API Connectivity Error:", error);
        throw new Error("Unable to connect to the server. Render backend might be waking up (takes ~50s). Please refresh after a moment.");
    }
};

export default BASE_URL;
