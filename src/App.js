import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/common/Header';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OtpVerificationPage from './pages/OtpVerificationPage';
import FormPage from './components/FormPage';
import DetailsPage from './components/DetailsPage';
import ResultPage from './components/ResultPage'; // Assuming you might have a list view
import './App.css';

// A wrapper for routes that require authentication
const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
};


function App() {
    return (
        <AuthProvider>
            <Router>
                <Header />
                <main className="container">
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/verify-otp" element={<OtpVerificationPage />} />
                        
                        {/* Protected Routes */}
                        <Route 
                            path="/form" 
                            element={
                                <PrivateRoute>
                                    <FormPage />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/trips" 
                            element={
                                <PrivateRoute>
                                    <ResultPage />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/trip/:tripId" 
                            element={
                                <PrivateRoute>
                                    <DetailsPage />
                                </PrivateRoute>
                            } 
                        />

                        {/* Fallback Route */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>
                <ToastContainer
                    position="bottom-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
            </Router>
        </AuthProvider>
    );
}

export default App;
