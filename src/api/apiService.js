import axios from 'axios';

// Define the base URL for your backend API
// Ensure this matches the port your backend server is running on (e.g., 5001)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Authentication ---

// Function to get Firebase ID token
const getAuthToken = async (auth) => {
  if (!auth.currentUser) return null;
  try {
    return await auth.currentUser.getIdToken(true); // Force refresh
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};


// Add a request interceptor to include the auth token
apiClient.interceptors.request.use(async (config) => {
    // We need access to the Firebase auth object here.
    // This is tricky without passing it in or using a global state/event bus.
    // For simplicity now, we'll assume the token is fetched before calling API functions that need it.
    // A better approach involves integrating auth state management (like your AuthContext).
    // See modified functions below.
  return config;
}, (error) => {
  return Promise.reject(error);
});


// Login/Register User with Backend (after Firebase sign-in)
// Updated to accept the token directly
export const registerUser = async (token) => {
  try {
    const response = await apiClient.post('/auth/register', {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Backend registration response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error registering user with backend:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Verify user with backend (can be used on login)
// Updated to accept the token directly
export const verifyUser = async (token) => {
    try {
        // You might want a dedicated login/verify endpoint or use the register endpoint
        // This example assumes a '/verify' endpoint exists or you adapt '/register'
        const response = await apiClient.post('/auth/verify', {}, { // Or potentially '/auth/register' if it handles both
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Backend verification response:", response.data);
        return response.data;
    } catch (error) {
        console.error('Error verifying user with backend:', error.response ? error.response.data : error.message);
        throw error; // Re-throw to be caught by calling function
    }
};


// --- Trip Planning ---

// Plan a new trip
// Updated to accept the token directly
export const planTrip = async (tripData, token) => {
  if (!token) {
      throw new Error("Authentication token is required to plan a trip.");
  }
  try {
    // Make sure the endpoint matches your backend route (e.g., /trips/plan)
    const response = await apiClient.post('/trips/plan', tripData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error sending trip plan request:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Get all trips for the logged-in user
// Updated to accept the token directly
export const getUserTrips = async (token) => {
    if (!token) {
      throw new Error("Authentication token is required to get user trips.");
    }
    try {
        // Ensure endpoint matches backend (/trips/)
        const response = await apiClient.get('/trips', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user trips:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// Get details for a specific trip
// Updated to accept the token directly
export const getTripDetails = async (tripId, token) => {
     if (!token) {
      throw new Error("Authentication token is required to get trip details.");
    }
    try {
        // Ensure endpoint matches backend (/trips/:tripId)
        const response = await apiClient.get(`/trips/${tripId}`, {
             headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching details for trip ${tripId}:`, error.response ? error.response.data : error.message);
        throw error;
    }
};

// --- Destinations ---
export const getAllDestinations = async () => {
    try {
        // No token needed if this is public data
        const response = await apiClient.get('/trips/destinations'); // Matches the route we added
        return response.data;
    } catch (error) {
         console.error('Error fetching destinations:', error.response ? error.response.data : error.message);
        throw error;
    }
};


// Note: loginUser and verifyOtp seem related to a different auth flow (maybe email/password?)
// They are kept here but might need adjustment based on your backend implementation.
export const loginUser = async (credentials) => {
  // ... implementation needed ...
  console.warn("loginUser API call not fully implemented.");
  return Promise.reject("Not implemented");
};

export const verifyOtp = async (otpData) => {
  // ... implementation needed ...
  console.warn("verifyOtp API call not fully implemented.");
  return Promise.reject("Not implemented");
};


// Export the configured client if needed elsewhere, though usually you export functions
export default apiClient;
