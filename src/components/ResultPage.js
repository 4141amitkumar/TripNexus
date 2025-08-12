// ResultPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ResultPage.css'; // Make sure you have this CSS file

const DestinationCard = ({ place, rank }) => {
  console.log("Image URL:", place.image_url);
  return(<div className="destination-card">
    <div className="card-rank">#{rank}</div>
    <img
      src={place.image_url}
      alt={place.destination_name}
      className="card-image"
    />

    <div className="card-content">
      <h3 className="card-title">{place.destination_name}, {place.state}</h3>
      <p className="card-category">{place.category_name}</p>
      
      <div className="card-score">
        <span className="score-badge">⭐ {place.final_score.toFixed(1)}</span>
        <span className="rating-text">Overall Score</span>
      </div>

      <div className="card-details">
        <p><strong>Weather:</strong> {parseFloat(place.avg_temperature).toFixed(1)}°C</p>
        <p><strong>Distance:</strong> {place.distance_km} km</p>
        <p><strong>Est. Cost:</strong> ₹{place.estimated_avg_cost.toLocaleString()}</p>
      </div>
      
      <div className="scoring-breakdown">
        <h4>Scoring Breakdown:</h4>
        <ul>
          <li>Qual: {place.scoring_breakdown.quality.toFixed(1)}</li>
          <li>Weather: {place.scoring_breakdown.weather.toFixed(1)}</li>
          <li>Dist: {place.scoring_breakdown.distance.toFixed(1)}</li>
          <li>Pers: {place.scoring_breakdown.personalization.toFixed(1)}</li>
          <li>Budget: {place.scoring_breakdown.budget.toFixed(1)}</li>
        </ul>
      </div>
    </div>
  </div>)
};

const ResultPage = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // This effect runs only once when the component mounts.
    // Its only job is to read data from the session.
    try {
      const storedDataString = sessionStorage.getItem('recommendationResults');
      console.log('🔍 ResultPage: Reading from sessionStorage...');
      
      if (storedDataString) {
        const parsedData = JSON.parse(storedDataString);
        console.log('✅ ResultPage: Parsed data from storage:', parsedData);
        
        // 🔥 KEY FIX: Correctly access the 'recommendations' array
        if (parsedData && parsedData.success && Array.isArray(parsedData.recommendations)) {
          if (parsedData.recommendations.length > 0) {
            setRecommendations(parsedData.recommendations);
            setMetadata(parsedData.metadata);
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
      console.error('❌ ResultPage: Failed to parse recommendations from storage:', e);
      setError('A critical error occurred loading results. Please restart your search.');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array ensures this runs only once

  // Render Logic with clear states for loading, error, and success
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

  return (
    <div className="results-wrapper">
      <div className="results-header">
        <h2 className="results-title">Your Top {recommendations.length} Recommendations</h2>
        {metadata && (
          <p className="results-subtitle">
            Engine v{metadata.engine_version} found these results for you in {metadata.processing_time_ms}ms
          </p>
        )}
      </div>
      
      <div className="results-grid">
        {recommendations.map((place, index) => (
          <DestinationCard 
            key={place.destination_id} 
            place={place} 
            rank={index + 1}
          />
        ))}
      </div>
    </div>
  );
};

export default ResultPage;
