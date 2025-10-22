// src/App.js
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // Import useAuth hook

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TripPlan from './pages/TripPlan';
import TripDetails from './pages/TripDetails'; // Assuming you create this page
import TripResult from './pages/TripResult';   // Assuming you create this page

// Import Components
import NavBar from './components/NavBar';

// Import CSS
import './App.css';

// ProtectedRoute component
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" replace />;
  }
  return children;
}


function App() {
  const location = useLocation();
  const { currentUser } = useAuth();

  // Determine if NavBar should be shown
  const showNavBar = !['/', '/login', '/register'].includes(location.pathname) || currentUser;

  return (
    <div className="App">
      {showNavBar && <NavBar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/trip-plan"
          element={
            <ProtectedRoute>
              <TripPlan />
            </ProtectedRoute>
          }
        />
         <Route
          path="/trip-details"
          element={
            <ProtectedRoute>
              <TripDetails />
            </ProtectedRoute>
          }
        />
         <Route
          path="/trip-result"
          element={
            <ProtectedRoute>
              <TripResult />
            </ProtectedRoute>
          }
        />

        {/* Catch-all or 404 Route (optional) */}
        {/* <Route path="*" element={<NotFound />} /> */}
        <Route path="*" element={<Navigate to={currentUser ? "/trip-plan" : "/"} replace />} />

      </Routes>
    </div>
  );
}

export default App;
