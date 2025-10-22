// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase'; // Import auth and provider
import { useAuth } from '../context/AuthContext'; // Import useAuth
import './Login.css'; // Assuming Login.css for styling

const Login = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Get current user state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

   // If user is already logged in, redirect to trip plan page
   if (currentUser) {
    return <Navigate to="/trip-plan" replace />;
  }

  const handleGoogleSignIn = async () => {
    setError(''); // Clear previous errors
    setLoading(true); // Set loading state
    try {
      // Sign in with Google Popup
      const result = await signInWithPopup(auth, googleProvider);
      // This gives you a Google Access Token. You can use it to access the Google API.
      // const credential = GoogleAuthProvider.credentialFromResult(result);
      // const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      console.log('Google Sign-In successful:', user.uid);
      navigate('/trip-plan'); // Redirect to trip plan page on success
    } catch (error) {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      // const email = error.customData.email;
      // The AuthCredential type that was used.
      // const credential = GoogleAuthProvider.credentialFromError(error);
      console.error('Google Sign-In Error:', errorCode, errorMessage);
      setError(`Failed to sign in: ${errorMessage}`); // Display error to user
    } finally {
        setLoading(false); // Reset loading state
    }
  };

  // Google Sign-In button component (or integrate directly)
  const GoogleSignInButton = ({ onClick, disabled }) => (
    <button className="google-btn" onClick={onClick} disabled={disabled}>
      <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8 0 122.4 109.8 11.8 244 11.8c70.4 0 131.5 28.5 176.4 74.3l-69.5 67.3c-24.5-23-57.6-37.4-96.9-37.4-74.1 0-134.3 60.2-134.3 134.3s60.2 134.3 134.3 134.3c86.3 0 112.5-63.5 116.3-97.4H244V253.9h239.5c4.7 26.2 7.5 54.6 7.5 87.9z"/>
      </svg>
      <span>{loading ? 'Signing In...' : 'Sign in with Google'}</span>
    </button>
  );

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Sign In to TripNexus</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="login-actions">
           <GoogleSignInButton onClick={handleGoogleSignIn} disabled={loading} />
           <p className="switch-auth-link">
             Don't have an account? <Link to="/register">Register here</Link>
           </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
