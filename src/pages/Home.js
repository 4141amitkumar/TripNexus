import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import illustration from '../assets/travel-illustration.png';
import './Home.css';

// SVG component for the Google logo
const GoogleLogo = () => (
    <svg width="20" height="20" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285F4" d="M17.64 9.20455c0-.63864-.05727-1.25182-.16364-1.84091H9v3.48182h4.84364c-.20455 1.125-.82727 2.07818-1.77727 2.71818v2.25864h2.90818c1.70182-1.56636 2.68409-3.875 2.68409-6.61773z"/>
        <path fill="#34A853" d="M9 18c2.43 0 4.46727-.80182 5.95636-2.18182l-2.90818-2.25864c-.80182.53727-1.84091.85909-3.04818.85909-2.34545 0-4.32545-1.58182-5.03591-3.71045H.957273v2.33182C2.43818 16.0977 5.48182 18 9 18z"/>
        <path fill="#FBBC05" d="M3.96409 10.71c-.18-.53727-.28636-1.10227-.28636-1.68182s.10636-1.14455.28636-1.68182V5.01409H.957273C.347727 6.17318 0 7.54773 0 9c0 1.45227.347727 2.82682.957273 3.98591l3.006817-2.331818z"/>
        <path fill="#EA4335" d="M9 3.57955c1.32273 0 2.50773.45455 3.44091 1.34591l2.58182-2.58182C13.4636.891818 11.4259 0 9 0 5.48182 0 2.43818 1.90227.957273 4.65364L3.96409 6.98545C4.67455 4.85682 6.65455 3.57955 9 3.57955z"/>
    </svg>
);


function Home() {
    const { currentUser, signInWithGoogle } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if user is already logged in
    if (currentUser) {
        return <Navigate to="/plan" replace />; // Use replace to avoid back button issues
    }

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            await signInWithGoogle();
        } catch (err) {
            console.error("Home Page Google Action error:", err);
            if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
                 setError('Process cancelled. Please try again.');
            } else if (err.code) {
                 setError(`Failed: ${err.message}`);
            } else {
                 setError('An unexpected error occurred.');
            }
            setLoading(false);
        }
    };

    return (
        <div className="home-container">
            <header className="home-header">
                <h1>Welcome to TripNexus</h1>
                <p>Your ultimate AI-powered trip planner</p>
            </header>
            <main className="home-main">
                <div className="home-content">
                    <h2>Plan Your Next Adventure</h2>
                    <p>
                        Get personalized itineraries, discover hidden gems, and manage
                        your trips seamlessly. Let AI craft your perfect journey.
                    </p>
                     {error && <p className="error-message">{error}</p>}
                    <div className="home-cta">
                        {/* Sign In Button FIRST */}
                        <button
                            onClick={handleGoogleSignIn}
                            className="google-button google-signin-button"
                            disabled={loading}
                        >
                            <GoogleLogo />
                            <span>{loading ? 'Processing...' : 'Sign in with Google'}</span>
                        </button>

                        {/* Register Button SECOND */}
                         <button
                            onClick={handleGoogleSignIn}
                            className="google-button google-register-button"
                            disabled={loading}
                        >
                             <GoogleLogo />
                            <span>{loading ? 'Processing...' : 'Register with Google'}</span>
                        </button>
                    </div>
                </div>
                <div className="home-illustration">
                    <img src={illustration} alt="Travel illustration" />
                </div>
            </main>
            <footer className="home-footer">
                <p>&copy; 2025 TripNexus. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default Home;

