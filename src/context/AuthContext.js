import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const storedToken = localStorage.getItem('token');

            if (storedUser && storedToken) {
                setUser(storedUser);
                setToken(storedToken);
                setIsAuthenticated(true);
            }
        } catch (error) {
            // If parsing fails, clear storage
            logout();
        }
    }, []);

    const login = (userData, userToken) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userToken);
        setUser(userData);
        setToken(userToken);
        setIsAuthenticated(true);
        toast.success(`Welcome, ${userData.username}!`);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        toast.info("You have been logged out.");
    };

    const value = {
        user,
        token,
        isAuthenticated,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
