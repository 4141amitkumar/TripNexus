import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/apiService';
import '../styles/LandingPage.css';
import illustration from '../assets/travel-illustration.png'; // <-- Corrected to .png

function LandingPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!username || !email || !password) {
            setError('Please fill in all fields.');
            return;
        }

        try {
            const response = await registerUser({ username, email, password });
            setSuccess(response.message);
            // Redirect to OTP page with email state
            setTimeout(() => {
                navigate('/verify-otp', { state: { email } });
            }, 1500); // Wait a bit to show success message
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="landing-container">
            <div className="landing-left">
                <img src={illustration} alt="Travel Illustration" className="illustration" />
                <div className="hero-text">
                    <h1>Welcome to TripNexus</h1>
                    <p>Your ultimate travel planning companion. Discover, plan, and book your next adventure with ease.</p>
                </div>
            </div>
            <div className="landing-right">
                <div className="auth-form-container">
                    <h2>Create Your Account</h2>
                    <p>And start your journey with us!</p>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Choose a username"
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password"
                            />
                        </div>
                        {error && <p className="error-message">{error}</p>}
                        {success && <p className="success-message">{success}</p>}
                        <button type="submit" className="auth-button">Create Account</button>
                    </form>
                    <div className="switch-auth">
                        <p>Already have an account? <Link to="/login">Sign In</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;

