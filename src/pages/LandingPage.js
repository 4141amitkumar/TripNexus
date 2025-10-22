import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import '../styles/LandingPage.css';
import travelIllustration from '../assets/travel-illustration.png';

const LandingPage = () => {
    const { loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const idToken = credentialResponse.credential;
            await loginWithGoogle(idToken, () => navigate('/form'));
        } catch (error) {
            console.error('Google login failed:', error);
            // Handle login failure, maybe show a notification to the user
        }
    };

    const handleGoogleFailure = () => {
        console.error('Google login failed');
        // Handle login failure
    };

    return (
        <div className="landing-page">
            <div className="landing-container">
                <div className="landing-content">
                    <h1>Welcome to TripNexus</h1>
                    <p>Your ultimate travel planning companion. Let's plan your next adventure!</p>
                    <div className="google-login-container">
                         <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleFailure}
                            useOneTap
                        />
                    </div>
                </div>
                <div className="landing-illustration">
                    <img src={travelIllustration} alt="Travel Illustration" />
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
