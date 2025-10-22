import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    getAdditionalUserInfo // Import this to check if user is new
} from "firebase/auth";
import { auth, googleProvider } from '../firebase'; // Ensure firebase config is correct

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Function for Google Sign-In / Sign-Up
    async function signInWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const additionalUserInfo = getAdditionalUserInfo(result);

            // Check if it's a new user registration
            if (additionalUserInfo?.isNewUser) {
                console.log("New user registered via Google:", user.uid);
                // Handle new user logic if necessary (e.g., create profile in backend)
                // Redirect to trip plan page after successful registration
                navigate('/trip-plan'); // Or '/plan' based on your route
            } else {
                console.log("Existing user signed in via Google:", user.uid);
                // Redirect to trip plan page after successful login
                navigate('/trip-plan'); // Or '/plan' based on your route
            }
             // Auth state change will update currentUser via onAuthStateChanged
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            // Re-throw the error so the component calling this can handle it (e.g., show message)
            throw error;
        }
    }


    // Function for Logout
    function logout() {
        return signOut(auth);
    }

    // Listener for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setLoading(false); // Set loading to false once auth state is determined
             console.log("Auth State Changed:", user ? `User UID: ${user.uid}` : "No user");

             // Optional: Redirect based on auth state after initial load
             // Be careful with redirects here to avoid loops
             // if (user && ['/', '/login', '/register'].includes(window.location.pathname)) {
             //    navigate('/trip-plan');
             // } else if (!user && !['/', '/login', '/register'].includes(window.location.pathname)) {
             //    navigate('/');
             // }
        });

        return unsubscribe; // Cleanup subscription on unmount
    }, [navigate]); // Add navigate as dependency if used inside useEffect

    // Value provided by the context
    const value = {
        currentUser,
        loading,
        signInWithGoogle, // Make sure this is included
        logout
    };

    // Render children only when not loading, or handle loading state explicitly
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

