import axios from 'axios';

// Yeh .env file se API ka base URL lega jo root directory mein hai.
// Agar wahan nahi milta hai to default http://localhost:4001/api use karega.
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4001/api';

const api = axios.create({
    baseURL: API_URL,
});

/**
 * Yeh ek interceptor hai.
 * Yeh har API request bhejne se pehle check karega ki user logged in hai ya nahi.
 * Agar user logged in hai (localStorage mein token hai), to yeh us token ko
 * request ke header mein 'Authorization' ke saath bhej dega.
 * Isse backend ko pata chalega ki request ek authenticated user ne bheji hai.
 */
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

/**
 * Naye user ko register karne ke liye backend ko request bhejta hai.
 * @param {object} userData - { username, email, password }
 * @returns {Promise}
 */
export const registerUser = (userData) => {
    return api.post('/auth/register', userData).then(res => res.data);
};

/**
 * OTP ko verify karne ke liye backend ko request bhejta hai.
 * @param {object} data - { email, otp }
 * @returns {Promise} - Success hone par token return karta hai.
 */
export const verifyOtp = (data) => {
    return api.post('/auth/verify-otp', data).then(res => res.data);
};

/**
 * User ko login karne ke liye backend ko request bhejta hai.
 * @param {object} credentials - { email, password }
 * @returns {Promise} - Success hone par token return karta hai.
 */
export const loginUser = (credentials) => {
    return api.post('/auth/login', credentials).then(res => res.data);
};

/**
 * User ki preferences ke aadhar par trip recommendations laane ke liye request bhejta hai.
 * @param {object} preferences - User ki chayanit options.
 * @returns {Promise} - Trip recommendations ka array return karta hai.
 */
export const getRecommendations = (preferences) => {
    return api.post('/trips/recommendations', preferences).then(res => res.data);
};

// Bhavishya mein anya API calls yahan add ki ja sakti hain, jaise:
// export const getTripDetails = (tripId) => {
//     return api.get(`/trips/${tripId}`).then(res => res.data);
// };

