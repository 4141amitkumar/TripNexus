import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import '../styles/DetailsPage.css';

const DetailsPage = () => {
  const location = useLocation();
  const { tripId } = useParams();
  
  // The trip data is passed via state from the ResultPage Link
  const trip = location.state?.trip;

  if (!trip) {
    // You could fetch the trip details here using the tripId if the user lands directly on this page
    return <div className="details-container"><h2>Trip not found or data missing.</h2></div>;
  }

  const handleBooking = () => {
      alert(`Booking for ${trip.trip_name} is not yet implemented.`);
  }

  return (
    <div className="details-page">
      <div className="details-hero" style={{ backgroundImage: `url(${trip.image_url || 'https://placehold.co/1200x500'})` }}>
        <div className="hero-content">
          <h1>{trip.trip_name}</h1>
          <h2>{trip.destination_name}</h2>
        </div>
      </div>

      <div className="details-body">
        <div className="details-main">
          <h3>About the Trip</h3>
          <p>{trip.description}</p>

          <div className="reviews-section">
            <h3>Reviews</h3>
            <p>Reviews will be shown here once the feature is implemented.</p>
          </div>
        </div>

        <aside className="details-sidebar">
          <div className="booking-card">
            <h4>Trip Details</h4>
            <ul>
              <li><strong>Duration:</strong> {trip.num_days} Days</li>
              <li><strong>Travel Style:</strong> {trip.group_type}</li>
              <li><strong>Matches Interests:</strong> {trip.interest_matches} of your interests</li>
            </ul>
            <div className="price-tag">
              <span>Starts From</span>
              <p>₹{Number(trip.base_cost).toLocaleString()}</p>
            </div>
            <button className="book-now-btn" onClick={handleBooking}>Book Now</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DetailsPage;

