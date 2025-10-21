import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/common/Header';
import LandingPage from './pages/LandingPage';
import FormPage from './components/FormPage';
import ResultPage from './components/ResultPage';
import DetailsPage from './components/DetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OtpVerificationPage from './pages/OtpVerificationPage'; // OTP Page ko import karein
import './App.css';

// Yeh naya component routing changes ko sahi se handle karega
const AppContent = () => {
  const location = useLocation();
  // location.pathname se humesha current page ka path milega
  const isLandingOrAuthPage = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/verify-otp';

  return (
    <>
      {/* Header ab landing aur auth pages par hide hoga */}
      {!isLandingOrAuthPage && <Header />}
      <main className={!isLandingOrAuthPage ? "app-content" : ""}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<OtpVerificationPage />} /> {/* OTP Page ka route add karein */}
          <Route path="/find-trip" element={<FormPage />} />
          <Route path="/results" element={<ResultPage />} />
          <Route path="/details/:tripId" element={<DetailsPage />} />
        </Routes>
      </main>
    </>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <AppContent />
      </div>
    </Router>
  );
}

export default App;

