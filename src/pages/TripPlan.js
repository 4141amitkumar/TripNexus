// src/pages/TripPlan.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Use auth context
// Corrected Import: Use planTrip instead of generateTripPlan
import { planTrip } from '../api/apiService';
import './TripPlan.css';

const TripPlan = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Get current user
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    interests: [],
    travelers: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prevData) => ({
        ...prevData,
        interests: checked
          ? [...prevData.interests, value]
          : prevData.interests.filter((interest) => interest !== value),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

     if (!currentUser) {
        setError("You must be logged in to plan a trip.");
        setLoading(false);
        return; // Early exit if not logged in
    }


    try {
      console.log('Submitting trip plan request:', formData);
      const dataToSend = { ...formData, userId: currentUser.uid };

      // Corrected Function Call: Use planTrip here (around line 64)
      const tripData = await planTrip(dataToSend);

      console.log('Trip plan generated:', tripData);

      // Navigate to the results page, passing data via state
      // Ensure navigation logic is present and correct
      navigate('/trip-result', { state: { tripData, requestData: formData } });

    } catch (err) {
      console.error('Error generating trip plan:', err);
      setError(err.message || 'Failed to generate trip plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component JSX remains the same...
  return (
    <div className="trip-plan-container">
      <h2>Plan Your Trip</h2>
      <p>Fill in your preferences and let our AI create the perfect itinerary!</p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="trip-plan-form">
        {/* Destination */}
        <div className="form-group">
          <label htmlFor="destination">Destination:</label>
          <input
            type="text"
            id="destination"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            required
            placeholder="e.g., Paris, France"
          />
        </div>

        {/* Dates */}
         <div className="form-group form-group-inline">
            <div>
                 <label htmlFor="startDate">Start Date:</label>
                <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                 />
            </div>
             <div>
                <label htmlFor="endDate">End Date:</label>
                <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                 />
            </div>
        </div>


        {/* Budget */}
        <div className="form-group">
          <label htmlFor="budget">Budget (Approx. in USD):</label>
          <input
            type="number"
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            placeholder="e.g., 1500"
            min="0"
          />
        </div>

         {/* Number of Travelers */}
        <div className="form-group">
          <label htmlFor="travelers">Number of Travelers:</label>
          <input
            type="number"
            id="travelers"
            name="travelers"
            value={formData.travelers}
            onChange={handleChange}
            min="1"
            required
          />
        </div>


        {/* Interests (Example Checkboxes) */}
        <div className="form-group">
          <label>Interests:</label>
          <div className="checkbox-group">
            {['History', 'Adventure', 'Food', 'Nature', 'Art', 'Nightlife', 'Relaxation'].map((interest) => (
              <label key={interest}>
                <input
                  type="checkbox"
                  name="interests"
                  value={interest}
                  checked={formData.interests.includes(interest)}
                  onChange={handleChange}
                />
                {interest}
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Generating Plan...' : 'Generate Trip Plan'}
        </button>
      </form>
    </div>
  );
};

export default TripPlan;

