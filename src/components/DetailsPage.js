import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTripDetails } from '../api/apiService';
import '../styles/DetailsPage.css';

const DetailsPage = () => {
    const { tripId } = useParams();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                setLoading(true);
                const response = await getTripDetails(tripId);
                setTrip(response.data);
            } catch (error) {
                console.error("Failed to fetch trip details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (tripId) {
            fetchTrip();
        }
    }, [tripId]);

    if (loading) {
        return <div className="loading-container">Loading trip details...</div>;
    }

    if (!trip) {
        return <div className="error-container">Could not load trip details.</div>;
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="details-container">
            <div className="trip-summary">
                <h1>Trip to {trip.end_city}</h1>
                <p><strong>From:</strong> {formatDate(trip.start_date)} to {formatDate(trip.end_date)}</p>
                <p><strong>Budget:</strong> ${trip.budget}</p>
            </div>

            <div className="itinerary">
                <h2>Itinerary</h2>
                {trip.days && trip.days.length > 0 ? (
                    trip.days.map((day) => (
                        <div key={day.day_id} className="day-card">
                            <h3>Day {new Date(day.day_date).getDate() - new Date(trip.start_date).getDate() + 1}: {formatDate(day.day_date)}</h3>
                            {day.activities && day.activities.length > 0 ? (
                                <ul className="activity-list">
                                    {day.activities.map((activity) => (
                                        <li key={activity.activity_id} className="activity-item">
                                            <div className="activity-time">{activity.start_time.substring(0, 5)} - {activity.end_time.substring(0, 5)}</div>
                                            <div className="activity-details">
                                                <strong>{activity.activity_name}</strong>
                                                <p>Estimated Cost: ${activity.estimated_cost}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No activities planned for this day.</p>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No daily plans available for this trip.</p>
                )}
            </div>
        </div>
    );
};

export default DetailsPage;
