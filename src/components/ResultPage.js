import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ResultPage.css";
const API_URL = process.env.REACT_APP_API_URL;
const ResultPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("tripUserData"));
    const userLocation = JSON.parse(localStorage.getItem("userLocation"));
    const storedRecommendations = JSON.parse(localStorage.getItem("recommendations"));

    if (!data || !userLocation) {
      setLoading(false);
      return;
    }

    setUserData(data);

    // If recommendations already in localStorage, use them
    if (storedRecommendations && storedRecommendations.length > 0) {
      enrichPlacesWithDistance(storedRecommendations, userLocation);
    } else {
      // Otherwise, fetch from backend
      const travel_month_num = new Date(`${data.month} 1, 2025`).getMonth() + 1;
      fetch(`${API_URL}/api/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departure_lat: userLocation.lat,
          departure_lng: userLocation.lng,
          age: data.age,
          gender: data.gender,
          budget: data.budget,
          tourist_type: data.tripType,
          travel_month_num,
          preferred_type: data.type,
          duration_days: data.duration,
        }),
      })
        .then((res) => res.json())
        .then((places) => {
          if (!places || !places.length) {
            setFilteredPlaces([]);
            setLoading(false);
            return;
          }
          localStorage.setItem("recommendations", JSON.stringify(places));
          enrichPlacesWithDistance(places, userLocation);
        })
        .catch((err) => {
          console.error("Error fetching recommendations:", err);
          setLoading(false);
        });
    }
  }, []);

  const enrichPlacesWithDistance = async (places, userLocation) => {
    try {
      const enriched = await Promise.all(
        places.map(async (place) => {
          try {
            const res = await fetch(`${API_URL}/api/distance`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                origin: userLocation,
                destination: place.destination_name,
              }),
            });

            const distData = await res.json();

            return {
              ...place,
              travelCost: distData.travelCost || 0,
              travelMode: distData.mode || "Unknown",
              travelTime: distData.duration || "N/A",
              distanceKm: distData.distanceKm || 0,
            };
          } catch (error) {
            console.error("Error fetching distance:", error);
            return {
              ...place,
              travelCost: 0,
              travelMode: "Unavailable",
              travelTime: "N/A",
              distanceKm: 0,
            };
          }
        })
      );

      setFilteredPlaces(enriched);
      setLoading(false);
    } catch (err) {
      console.error("Error enriching places:", err);
      setLoading(false);
    }
  };

  const handleView = (id) => {
    navigate(`/details/${id}`);
  };

  if (loading) return <p className="loading">Loading...</p>;
  if (!userData) return <p className="error">User data not found.</p>;

  return (
    <div className="results-wrapper">
      <h2 className="results-title">Recommended Places for You</h2>
      <div className="results-grid">
        {filteredPlaces.length ? (
          filteredPlaces.map((place) => (
            <div key={place.destination_id} className="destination-card">
              <img
                src={place.image || "/default-image.jpg"}
                alt={place.destination_name}
                className="card-image"
              />
              <div className="card-content">
                <h3>{place.destination_name}</h3>
                <p>Category: {place.category_name}</p>
                <p>⭐ Overall Score: {place.overall_score}</p>
                <p>💰 Estimated Stay: ₹{place.estimated_total_cost}</p>
                {place.travelCost ? (
                  <>
                    <p>🛣️ Distance: {place.distanceKm} km</p>
                    <p>⏱️ Travel Time: {place.travelTime}</p>
                    <p>🚍 Mode: {place.travelMode}</p>
                    <p>
                      <strong>Total Cost: </strong>₹
                      {(place.estimated_total_cost || 0) + place.travelCost}
                    </p>
                  </>
                ) : (
                  <p className="error">❌ Distance info not available</p>
                )}
                <button
                  className="view-button"
                  onClick={() => handleView(place.destination_id)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-results">No recommendations found for your preferences.</p>
        )}
      </div>
    </div>
  );
};

export default ResultPage;
