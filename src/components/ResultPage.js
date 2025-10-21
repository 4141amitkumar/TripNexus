import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, MarkerF } from "@react-google-maps/api";
import '../styles/ResultPage.css';

const libraries = ["places"];

// SVG Icons for the card details
const WeatherIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
);
const DistanceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="5" y1="12" x2="1" y2="12"/><line x1="23" y1="12" x2="19" y2="12"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="1"/></svg>
);
const CostIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);

const DestinationCard = ({ place, rank, onMouseEnter, isActive }) => {
  const navigate = useNavigate();

  return (
    <div 
      className={`destination-card ${isActive ? 'active' : ''}`}
      onMouseEnter={() => onMouseEnter(place)}
      onClick={() => navigate(`/details/${place.destination_id}`)}
    >
      <div className="card-rank">#{rank}</div>
      <div className="card-image-container">
        <img
          src={place.image_url}
          alt={place.destination_name}
          className="card-image"
        />
      </div>

      <div className="card-content">
        <div>
          <h3 className="card-title">{place.destination_name}, {place.state}</h3>
          <p className="card-category">{place.category_name}</p>
        </div>
        
        <div className="card-details-grid">
          <div className="card-detail-item">
            <WeatherIcon />
            <span>{parseFloat(place.avg_temperature).toFixed(1)}°C</span>
          </div>
          <div className="card-detail-item">
            <DistanceIcon />
            <span>{Math.round(place.distance_km)} km</span>
          </div>
          <div className="card-detail-item">
            <CostIcon />
            <span>₹{place.estimated_avg_cost.toLocaleString()}</span>
          </div>
        </div>

        <div className="card-footer">
          <div className="card-score">
            <span className="score-badge">⭐ {place.final_score.toFixed(1)}</span>
            <span className="rating-text">Score</span>
          </div>
          <button 
            className="view-details-btn"
            onClick={(e) => {
              e.stopPropagation(); // prevent card's onClick from firing
              navigate(`/details/${place.destination_id}`);
            }}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};


const ResultPage = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [activeDestination, setActiveDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const storedDataString = sessionStorage.getItem('recommendationResults');
      if (storedDataString) {
        const parsedData = JSON.parse(storedDataString);
        if (parsedData && parsedData.success && Array.isArray(parsedData.recommendations)) {
          if (parsedData.recommendations.length > 0) {
            setRecommendations(parsedData.recommendations);
            setMetadata(parsedData.metadata);
            setActiveDestination(parsedData.recommendations[0]); // Set first result as active initially
          } else {
            setError("We couldn't find any destinations for you. Try different preferences!");
          }
        } else {
          setError('The recommendation data format is incorrect. Please try again.');
        }
      } else {
        setError('No recommendation data found. Please start a new search.');
      }
    } catch (e) {
      console.error('Failed to parse recommendations from storage:', e);
      setError('A critical error occurred loading results. Please restart your search.');
    } finally {
      setLoading(false);
    }
  }, []);

  const mapContainerStyle = {
    width: "100%",
    height: "100%",
    borderRadius: "16px",
  };

  if (loading) {
    return <div className="status-container"><h2>Loading your personalized results...</h2></div>;
  }

  if (error) {
    return (
      <div className="status-container error-state">
        <h2>Oops! An Error Occurred.</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Start a New Search
        </button>
      </div>
    );
  }
  
  const center = activeDestination ? {
    lat: activeDestination.latitude,
    lng: activeDestination.longitude,
  } : {
    lat: 20.5937, // Default to India
    lng: 78.9629,
  };

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <div className="results-wrapper">
        <div className="results-header">
          <h2 className="results-title">Your Top {recommendations.length} Recommendations</h2>
          {metadata && (
            <p className="results-subtitle">
              Engine v{metadata.engine_version} found these results for you in {metadata.processing_time_ms}ms
            </p>
          )}
        </div>
        
        <div className="results-page-grid">
          <div className="results-list">
            {recommendations.map((place, index) => (
              <DestinationCard 
                key={place.destination_id} 
                place={place} 
                rank={index + 1}
                onMouseEnter={setActiveDestination}
                isActive={activeDestination && activeDestination.destination_id === place.destination_id}
              />
            ))}
          </div>

          <div className="map-container">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={activeDestination ? 8 : 4}
              center={center}
            >
              {activeDestination && <MarkerF position={center} />}
            </GoogleMap>
          </div>
        </div>
      </div>
    </LoadScript>
  );
};

export default ResultPage;
