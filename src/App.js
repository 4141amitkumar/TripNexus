import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LandingPage from './pages/LandingPage';
import FormPage from './components/FormPage';
import ResultPage from './components/ResultPage';
import DetailsPage from './components/DetailsPage';
import Header from './components/common/Header';
import './App.css';

function App() {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  if (!clientId) {
    console.error("Google Client ID not found. Make sure you have set REACT_APP_GOOGLE_CLIENT_ID in your .env file.");
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/form" element={<FormPage />} />
            <Route path="/results" element={<ResultPage />} />
            <Route path="/details" element={<DetailsPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

