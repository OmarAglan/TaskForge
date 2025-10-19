/**
 * Creates and configures an Axios HTTP client instance.
 *
 * @returns AxiosInstance An Axios HTTP client instance configured with the baseURL.
 */
import axios from 'axios';

export default () => {
    const api = axios.create({
        baseURL: 'http://localhost:8081',
    });
    
    // Add request interceptor to include JWT token in headers
    api.interceptors.request.use(config => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });
    
    // Add response interceptor to handle 401 errors (unauthorized)
    api.interceptors.response.use(
        response => response,
        error => {
            if (error.response && error.response.status === 401) {
                // Token is invalid or expired
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
                // Redirect to login page
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );
    
    return api;
}