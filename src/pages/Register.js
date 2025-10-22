// src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { signInWithPopup, getAdditionalUserInfo } from 'firebase/auth';
import { auth, googleProvider } from '../firebase'; // Import auth and provider
import { useAuth } from '../context/AuthContext'; // Import useAuth
import './Register.css'; // Assuming Register.css for styling

const Register = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Get current user state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If user is already logged in, redirect to trip plan page
   if (currentUser) {
    return <Navigate to="/trip-plan" replace />;
  }

  const handleGoogleSignUp = async () => {
    setError(''); // Clear previous errors
    setLoading(true); // Set loading state
    try {
      // Sign in with Google Popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const additionalUserInfo = getAdditionalUserInfo(result);

      if (additionalUserInfo?.isNewUser) {
        // User is newly created
        console.log('Google Sign-Up successful (New User):', user.uid);
        // Optional: Send user data to your backend here if needed
        navigate('/trip-plan'); // Redirect to trip plan page
      } else {
        // User already exists
        console.warn('Google Sign-In attempted on Register page (Existing User):', user.uid);
        // It's generally better UX to just log them in if they exist
        // navigate('/trip-plan');
        // OR show an error and prompt to log in:
        setError('An account with this Google account already exists. Please sign in instead.');
        // Optional: Automatically sign them out if you strictly want registration only
        // await auth.signOut();
        // navigate('/login');
      }
    } catch (error) {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error('Google Sign-Up Error:', errorCode, errorMessage);
       if (errorCode === 'auth/popup-closed-by-user') {
            setError('Sign-up cancelled.');
       } else if (errorCode === 'auth/account-exists-with-different-credential') {
            setError('An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.');
       } else {
            setError(`Failed to register: ${errorMessage}`);
       }
    } finally {
        setLoading(false); // Reset loading state
    }
  };

  // Google Sign-Up button component
  const GoogleSignUpButton = ({ onClick, disabled }) => (
    <button className="google-btn" onClick={onClick} disabled={disabled}>
      <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8 0 122.4 109.8 11.8 244 11.8c70.4 0 131.5 28.5 176.4 74.3l-69.5 67.3c-24.5-23-57.6-37.4-96.9-37.4-74.1 0-134.3 60.2-134.3 134.3s60.2 134.3 134.3 134.3c86.3 0 112.5-63.5 116.3-97.4H244V253.9h239.5c4.7 26.2 7.5 54.6 7.5 87.9z"/>
      </svg>
      <span>{loading ? 'Registering...' : 'Register with Google'}</span>
    </button>
  );

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Register for TripNexus</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="register-actions">
           <GoogleSignUpButton onClick={handleGoogleSignUp} disabled={loading} />
           <p className="switch-auth-link">
             Already have an account? <Link to="/login">Sign in here</Link>
           </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
