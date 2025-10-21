import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import '../styles/ResultPage.css';

const ResultPage = () => {
  const location = useLocation();
  const recommendations = location.state?.recommendations || [];

  if (recommendations.length === 0) {
    return (
      <div className="results-container">
        <h2>No trips match your criteria.</h2>
        <p>Try adjusting your filters for more results.</p>
        <Link to="/" className="back-link">Go Back</Link>
      </div>
    );
  }

  return (
    <div className="results-container">
      <h2>Your Recommended Trips</h2>
      <div className="results-grid">
        {recommendations.map((trip) => (
          <Link to={`/details/${trip.trip_id}`} state={{ trip }} key={trip.trip_id} className="result-card-link">
            <div className="result-card">
              <img src={trip.image_url || 'https://placehold.co/600x400'} alt={trip.trip_name} />
              <div className="card-content">
                <h3>{trip.trip_name}</h3>
                <p>{trip.destination_name}</p>
                <div className="card-footer">
                    <span>{trip.num_days} Days</span>
                    <span className="price">₹{trip.base_cost}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ResultPage;
