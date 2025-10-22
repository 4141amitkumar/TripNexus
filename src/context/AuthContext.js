import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/apiService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // You might want to verify the token with the backend here
            // For simplicity, we'll just decode it or fetch user profile
            // Here we assume if a token exists, the user is "logged in".
            // A better approach is to have an endpoint like /api/auth/me
            const storedUser = localStorage.getItem('user');
            if(storedUser) {
                setUser(JSON.parse(storedUser));
            }
        }
        setLoading(false);
    }, []);

    const loginWithGoogle = async (idToken, callback) => {
        try {
            const { data } = await api.post('/api/auth/google-login', { token: idToken });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            if (callback) callback();
        } catch (error) {
            console.error('Error during Google login:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const authContextValue = {
        user,
        isAuthenticated: !!user,
        loading,
        loginWithGoogle,
        logout,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
