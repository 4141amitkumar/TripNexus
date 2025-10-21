import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOtp } from '../api/apiService';
import { toast } from 'react-toastify';
import './AuthForm.css';
import '../styles/OtpPage.css';

const OtpVerificationPage = () => {
    const [otp, setOtp] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email; // Get email passed from registration page

    if (!email) {
        // Redirect if email is not available, which means user landed here directly
        navigate('/register');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await verifyOtp({ email, otp });
            toast.success('Verification successful! Please log in.');
            navigate('/login');
        } catch (error) {
            console.error('OTP verification failed:', error);
            // Error toast is handled by apiService interceptor
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Verify Your Email</h2>
                <p>An OTP has been sent to {email}</p>
                <div className="input-group">
                    <label htmlFor="otp">Enter OTP</label>
                    <input
                        type="text"
                        id="otp"
                        name="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        maxLength="6"
                    />
                </div>
                <button type="submit" className="auth-button">Verify OTP</button>
            </form>
        </div>
    );
};

export default OtpVerificationPage;
