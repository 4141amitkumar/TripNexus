import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ResultPage.css";

const ResultPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("tripUserData"));
    const userLocation = JSON.parse(localStorage.getItem("userLocation"));

    if (!data || !userLocation) return;

    setUserData(data);

    // Step 1: Get recommended destinations from backend (MySQL)
    fetch("http://localhost:5000/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        month: data.month,
        type: data.type,
        budget: data.budget,
      }),
    })
      .then((res) => res.json())
      .then(async (places) => {
        // Step 2: Enrich with travel info
        const enriched = await Promise.all(
          places.map(async (place) => {
            try {
              const res = await fetch("http://localhost:5000/api/distance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  origin: userLocation,
                  destination: place.name,
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
      })
      .catch((err) => {
        console.error("Error fetching recommendations:", err);
        setLoading(false);
      });
  }, []);

  const handleView = (id) => {
    navigate(`/details/${id}`);
  };

  if (!userData || loading) return <p className="loading">Loading...</p>;

  return (
    <div className="results-wrapper">
      <h2 className="results-title">Recommended Places for You</h2>
      <div className="results-grid">
        {filteredPlaces.length ? (
          filteredPlaces.map((place) => (
            <div key={place.id} className="destination-card">
              <img src={place.image} alt={place.name} className="card-image" />
              <div className="card-content">
                <h3>{place.name}</h3>
                <p>Type: {place.type}</p>
                {place.travelCost ? (
                  <>
                    <p>🛣️ Distance: {place.distanceKm} km</p>
                    <p>⏱️ Travel Time: {place.travelTime}</p>
                    <p>🚍 Mode: {place.travelMode}</p>
                    <p>🧳 Travel Cost: ₹{place.travelCost}</p>
                    <p>🏨 Stay Cost: ₹{place.estimatedCost}</p>
                    <p>
                      💰 <strong>Total Budget:</strong> ₹
                      {place.estimatedCost + place.travelCost}
                    </p>
                  </>
                ) : (
                  <p className="error">❌ Distance info not available</p>
                )}
                <button
                  className="view-button"
                  onClick={() => handleView(place.id)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-results">No results found based on your preferences.</p>
        )}
      </div>
    </div>
  );
};

export default ResultPage;
