import axios from 'axios';
import { toast } from 'react-toastify';

// Create an Axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unknown error occurred';
    toast.error(message);
    
    if (error.response?.status === 401) {
        // Handle unauthorized access, e.g., redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // This relies on a router history object or a page reload
        window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);


// --- AUTH API CALLS ---
export const registerUser = (userData) => api.post('/auth/register', userData);
export const verifyOtp = (otpData) => api.post('/auth/verify-otp', otpData);
export const loginUser = (credentials) => api.post('/auth/login', credentials);

// --- TRIP API CALLS ---
export const planTrip = (tripData) => api.post('/trip/plan', tripData);
export const getUserTrips = (userId) => api.get(`/trip/trips/${userId}`);
export const getTripDetails = (tripId) => api.get(`/trip/${tripId}`);

export default api;
