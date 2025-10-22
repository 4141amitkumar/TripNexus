// src/pages/TripDetails.js (Moved from components/DetailsPage.js)
// Example Structure - Adapt based on your original DetailsPage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TripDetails.css'; // Assuming styling is here

const TripDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // Assuming you passed the initial trip plan request data via state
    const initialRequestData = location.state?.requestData;

    const [details, setDetails] = useState({
        transportation: 'Flight',
        accommodation: 'Hotel',
        pace: 'Moderate',
        // Add other detail fields as needed
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!initialRequestData) {
            console.warn("Initial trip request data not found, redirecting to plan.");
            navigate('/trip-plan'); // Redirect if accessed directly without data
        }
    }, [initialRequestData, navigate]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleBack = () => {
        navigate('/trip-plan'); // Go back to the initial form
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Combine initial request data with these details
        const completeTripRequest = {
            ...initialRequestData,
            ...details
        };

        console.log("Submitting complete trip request:", completeTripRequest);

        // Here you would typically make another API call or
        // navigate to the result page with the combined data
        // For now, let's assume we navigate directly to results
        // In a real app, you might re-run generation with more details

        // Simulate API call delay
        setTimeout(() => {
            try {
                 // Pass combined data to the result page
                 navigate('/trip-result', { state: { requestData: completeTripRequest } });
            } catch (err) {
                 setError("Failed to proceed. Please try again.");
            } finally {
                setLoading(false);
            }
        }, 1000);
    };

    if (!initialRequestData) {
        return <p>Loading or redirecting...</p>; // Or a loading indicator
    }

    return (
        <div className="trip-details-container">
            <h2>Refine Your Trip Details</h2>
            <p>Add more specifics about your travel style.</p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="trip-details-form">
                {/* Display summary of initial request (optional) */}
                <div className="request-summary">
                    <h4>Initial Request:</h4>
                    <p><strong>Destination:</strong> {initialRequestData.destination}</p>
                    <p><strong>Dates:</strong> {initialRequestData.startDate} to {initialRequestData.endDate}</p>
                    {/* Add more summary items */}
                </div>

                 <div className="form-group">
                    <label htmlFor="transportation">Preferred Transportation:</label>
                    <select id="transportation" name="transportation" value={details.transportation} onChange={handleChange}>
                        <option value="Flight">Flight</option>
                        <option value="Train">Train</option>
                        <option value="Car">Car</option>
                        <option value="Any">Any</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="accommodation">Accommodation Type:</label>
                    <select id="accommodation" name="accommodation" value={details.accommodation} onChange={handleChange}>
                        <option value="Hotel">Hotel</option>
                        <option value="Hostel">Hostel</option>
                        <option value="Airbnb">Airbnb/Rental</option>
                        <option value="Any">Any</option>
                    </select>
                </div>

                 <div className="form-group">
                    <label htmlFor="pace">Trip Pace:</label>
                    <select id="pace" name="pace" value={details.pace} onChange={handleChange}>
                        <option value="Relaxed">Relaxed</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Fast-paced">Fast-paced</option>
                    </select>
                </div>


                {/* Add more form fields for details */}

                 <div className="form-actions">
                    <button type="button" onClick={handleBack} className="back-button">
                        Back
                    </button>
                    <button type="submit" disabled={loading} className="submit-button">
                        {loading ? 'Processing...' : 'Generate Final Plan'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TripDetails;
