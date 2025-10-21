import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyOtp } from '../api/apiService';
import AuthContext from '../context/AuthContext';
import './AuthForm.css';

function OtpVerificationPage() {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);
    const email = location.state?.email;

    if (!email) {
        // Redirect to register if email is not in state
        navigate('/');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await verifyOtp({ email, otp });
            login(response.token);
            navigate('/find-trip');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-form-container">
                <h2>Verify Your Email</h2>
                <p>An OTP has been sent to {email}.</p>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="otp">Enter OTP</label>
                        <input
                            type="text"
                            id="otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="6-digit code"
                            required
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify & Proceed'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default OtpVerificationPage;

