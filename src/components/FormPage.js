// FormPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
import '../styles/FormPage.css';

const libraries = ['places'];

const FormPage = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', location: '', age: '', gender: 'Male',
    budget: '', tripType: 'Solo', month: 'January',
    type: 'Mountain Adventures', duration: '',
  });

  const [locationCoords, setLocationCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const autocompleteRef = useRef(null);
  const navigate = useNavigate();

  // Utility to fetch city name from coordinates
  const fetchCityFromCoords = async (lat, lon) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await response.json();
      const { city, town, state } = data.address;
      const locationText = [city || town, state].filter(Boolean).join(', ');
      setFormData(prev => ({ ...prev, location: locationText }));
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      position => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocationCoords(coords);
        fetchCityFromCoords(coords.lat, coords.lng);
      },
      () => {
        console.warn('Location access denied. User needs to enter location manually.');
      }
    );
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.geometry) {
        const coords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setFormData(prev => ({ ...prev, location: place.formatted_address }));
        setLocationCoords(coords);
      }
    }
  };
  
  /**
   * Handles the main form submission.
   * This is the single point of contact with the backend to get recommendations.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.location || !locationCoords) {
      setError('Please provide a valid departure point.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const API_URL = process.env.REACT_APP_API_URL;
      if (!API_URL) throw new Error('API URL is not configured.');

      // Prepare payload for the recommendation engine
      const payload = {
        departure_lat: locationCoords.lat,
        departure_lng: locationCoords.lng,
        departure_point: formData.location,
        age: parseInt(formData.age, 10),
        gender: formData.gender,
        budget: parseInt(formData.budget, 10),
        tourist_type: formData.tripType,
        travel_month_num: new Date(`${formData.month} 1, 2025`).getMonth() + 1,
        preferred_type: formData.type,
        duration_days: parseInt(formData.duration, 10),
      };

      console.log('🚀 Sending payload to recommendation engine:', payload);
      
      const response = await fetch(`${API_URL}/api/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'The server responded with an error.');
      }

      const data = await response.json();

      if (data.success) {
        // Use sessionStorage for session-specific data. It's cleaner.
        sessionStorage.setItem('recommendationResults', JSON.stringify(data));
        console.log('✅ Recommendations received and saved to sessionStorage. Navigating...');
        navigate('/results');
      } else {
        throw new Error(data.error || 'Failed to retrieve recommendations.');
      }

    } catch (err) {
      console.error('❌ Form submission failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={libraries}>
      <div className="form-wrapper">
        <h1 className="title">TripNexus: Your Smart Travel Planner</h1>
        <p className="subtitle">Fill in your details to get personalized travel recommendations.</p>
        <form onSubmit={handleSubmit} className="form-grid">
          {/* Form fields remain the same, they are well-structured */}
          <div className="form-group">
            <label>Departure Point:</label>
            <Autocomplete
              onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
              onPlaceChanged={handlePlaceChanged}
            >
              <input type="text" id="location" required value={formData.location} onChange={handleChange} placeholder="Enter your city" />
            </Autocomplete>
          </div>
          {/* Other form fields like age, budget etc. */}
          {["age", "budget", "duration"].map((id) => (
            <div className="form-group" key={id}>
              <label>{id.charAt(0).toUpperCase() + id.slice(1)}:</label>
              <input type="number" id={id} required value={formData[id]} onChange={handleChange} placeholder={`Enter your ${id}`} />
            </div>
          ))}
          {/* Select dropdowns... */}
          <div className="form-group">
            <label>Trip Type:</label>
            <select id="tripType" onChange={handleChange} value={formData.tripType}>
              <option>Solo</option> <option>Family</option> <option>Friends</option> <option>Couple</option>
            </select>
          </div>
          <div className="form-group">
            <label>Month of Travel:</label>
            <select id="month" onChange={handleChange} value={formData.month}>
              {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Preferred Type:</label>
            <select id="type" onChange={handleChange} value={formData.type}>
              <option>Mountain Adventures</option>
              {/* Other options... */}
            </select>
          </div>
          
          <button className="submit-button" type="submit" disabled={loading}>
            {loading ? 'Finding Your Perfect Trip...' : 'Find Destinations'}
          </button>
          
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </LoadScript>
  );
};

export default FormPage;
