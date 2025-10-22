import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './NavBar.css';

function NavBar() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/'); // Redirect to home page after logout
        } catch (error) {
            console.error("Failed to log out:", error);
            // Optionally: show an error message to the user
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to={currentUser ? "/plan" : "/"}>TripNexus</Link>
            </div>
            <div className="navbar-links">
                {currentUser ? (
                    // Links visible when logged in
                    <>
                        <Link to="/plan">Plan Trip</Link>
                        {/* Add other links for logged-in users if needed */}
                        <button onClick={handleLogout} className="navbar-button logout-button">
                            Logout
                        </button>
                    </>
                ) : (
                    // Links visible when logged out
                    <>
                        <Link to="/login" className="navbar-button login-button">
                            Login
                        </Link>
                        <Link to="/register" className="navbar-button register-button">
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default NavBar;

