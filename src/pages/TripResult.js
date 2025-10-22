// src/pages/TripResult.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
// Corrected Import: Use planTrip instead of generateTripPlan
import { planTrip } from '../api/apiService';
import './TripResult.css';

const TripResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const initialTripData = location.state?.tripData;
    const requestData = location.state?.requestData;

    const [tripPlan, setTripPlan] = useState(initialTripData);
    const [loading, setLoading] = useState(!initialTripData && !!requestData); // Only load if requestData exists but initialTripData doesn't
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlanIfNeeded = async () => {
            if (!initialTripData && requestData) {
                console.log("No initial trip data, fetching based on request:", requestData);
                setLoading(true); // Ensure loading is true
                setError(null);
                try {
                    // Corrected Function Call: Use planTrip here (around line 32)
                    const fetchedData = await planTrip(requestData);
                    setTripPlan(fetchedData);
                } catch (err) {
                    console.error("Error fetching trip plan on result page:", err);
                    setError(err.message || "Failed to load trip plan.");
                } finally {
                    setLoading(false);
                }
            } else if (!initialTripData && !requestData) {
                console.error("TripResult page loaded without trip data or request data.");
                setError("Could not load trip details. Please start over.");
                setLoading(false);
            } else {
                 setLoading(false); // Already have data, no need to load
            }
        };

        fetchPlanIfNeeded();
        // Added dependencies: initialTripData, requestData, navigate
    }, [initialTripData, requestData, navigate]);

     const handleGoBack = () => {
        navigate('/trip-plan');
     }

    if (loading) {
        return <div className="loading-message">Generating your amazing trip plan...</div>;
    }

    if (error) {
        return (
             <div className="error-container">
                <p className="error-message">{error}</p>
                <Link to="/trip-plan" className="back-link">Try Planning Again</Link>
             </div>
         );
    }

     if (!tripPlan) {
        return (
             <div className="error-container">
                <p className="error-message">No trip plan data available.</p>
                <Link to="/trip-plan" className="back-link">Start Planning</Link>
             </div>
        );
    }

    const renderItinerary = () => {
        if (!tripPlan.itinerary || tripPlan.itinerary.length === 0) {
            return <p>No itinerary details available.</p>;
        }
        return tripPlan.itinerary.map((day, index) => (
            <div key={index} className="day-plan">
                <h3>Day {day.day || index + 1}: {day.title || `Exploring ${tripPlan.destination}`}</h3>
                <p>{day.description || 'Enjoy your day!'}</p>
                {day.activities && day.activities.length > 0 && (
                    <ul>
                        {day.activities.map((activity, actIndex) => (
                            <li key={actIndex}>{activity}</li>
                        ))}
                    </ul>
                )}
            </div>
        ));
    };

    // Rest of the component JSX remains the same...
    return (
        <div className="trip-result-container">
            <h2>Your Trip Plan for {tripPlan.destination || requestData?.destination || 'Your Destination'}</h2>
            <div className="trip-summary">
                 {tripPlan.duration && <p><strong>Duration:</strong> {tripPlan.duration} days</p>}
                 {tripPlan.budget && <p><strong>Estimated Budget:</strong> ${tripPlan.budget}</p>}
                 {tripPlan.travelers && <p><strong>Travelers:</strong> {tripPlan.travelers}</p>}
                 {requestData?.startDate && requestData?.endDate && !tripPlan.duration &&
                     <p><strong>Dates:</strong> {requestData.startDate} to {requestData.endDate}</p>
                 }
                 {requestData?.interests && requestData.interests.length > 0 &&
                    <p><strong>Interests:</strong> {requestData.interests.join(', ')}</p>
                 }
            </div>

            <div className="itinerary-section">
                <h3>Daily Itinerary</h3>
                {renderItinerary()}
            </div>

             {tripPlan.accommodation_options && tripPlan.accommodation_options.length > 0 && (
                <div className="recommendations-section">
                    <h3>Accommodation Ideas</h3>
                     <ul>
                        {tripPlan.accommodation_options.map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                </div>
            )}

             {tripPlan.transportation_details && (
                 <div className="recommendations-section">
                    <h3>Transportation Notes</h3>
                    <p>{tripPlan.transportation_details}</p>
                 </div>
             )}


             <button onClick={handleGoBack} className="back-button">Plan Another Trip</button>

        </div>
    );
};

export default TripResult;

