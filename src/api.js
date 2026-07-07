// Central API Configuration
// Development: 'http://localhost:5000/api'
// Production:  'https://big-steps.onrender.com/api'
const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        // Check if running on local server/subnet
        if (
            hostname === 'localhost' || 
            hostname === '127.0.0.1' || 
            hostname.startsWith('192.168.') || 
            hostname.startsWith('10.') || 
            hostname.startsWith('172.')
        ) {
            // Use local subnet IP if connecting from another device (like mobile phone)
            if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
                return `http://${hostname}:5000/api`;
            }
            return 'http://localhost:5000/api';
        }
    }
    let url = import.meta.env.VITE_API_URL || 'https://big-steps.onrender.com/api';
    if (url) {
        url = url.replace(/\/+$/, ''); // Remove trailing slashes
        if (!url.endsWith('/api')) {
            url = `${url}/api`;
        }
    }
    return url;
};

const BASE_URL = getBaseUrl();

export const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const { exp } = JSON.parse(jsonPayload);
        if (exp && Date.now() >= exp * 1000) {
            return true;
        }
        return false;
    } catch {
        return true; // If parsing fails, treat it as expired/invalid
    }
};

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
            if (typeof window !== 'undefined') {
                const isAdminPath = window.location.pathname.startsWith('/admin') || 
                                    window.location.pathname.startsWith('/admission') || 
                                    window.location.pathname.startsWith('/all-students') || 
                                    window.location.pathname.startsWith('/batches') || 
                                    window.location.pathname.startsWith('/analytics');
                if (isAdminPath) {
                    localStorage.removeItem('admin_token');
                    localStorage.removeItem('admin_user');
                    window.location.href = '/admin-login?expired=true';
                } else {
                    localStorage.removeItem('user_token');
                    localStorage.removeItem('student_data');
                    window.location.href = '/login?expired=true';
                }
            }
        }

        return response;
    } catch (error) {
        console.error("API Connectivity Error:", error);
        throw new Error("Unable to connect to the server. Render backend might be waking up (takes ~50s). Please refresh after a moment.");
    }
};

export default BASE_URL;
