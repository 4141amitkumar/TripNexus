import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import destinations from "../data/destinations";
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

    // Filter destinations first
    const filtered = destinations.filter((place) => {
      const matchesType = place.type === data.type;
      const matchesMonth = place.months.includes(data.month);
      const withinBudget = place.estimatedCost <= data.budget;
      return matchesType && matchesMonth && withinBudget;
    });

    // Enrich with travel info from backend
    Promise.all(
      filtered.map(async (place) => {
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
    ).then((enrichedPlaces) => {
      setFilteredPlaces(enrichedPlaces);
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
          filteredPlaces.map((place) => {
            if (!place.travelCost) {
              return (
                <div key={place.id} className="destination-card">
                  <img src={place.image} alt={place.name} className="card-image" />
                  <div className="card-content">
                    <h3>{place.name}</h3>
                    <p>Type: {place.type}</p>
                    <p className="error">❌ Distance info not available</p>
                  </div>
                </div>
              );
            }
            return (
              <div key={place.id} className="destination-card">
                <img src={place.image} alt={place.name} className="card-image" />
                <div className="card-content">
                  <h3>{place.name}</h3>
                  <p>Type: {place.type}</p>
                  <p>🛣️ Distance: {place.distanceKm} km</p>
                  <p>⏱️ Travel Time: {place.travelTime}</p>
                  <p>🚍 Mode: {place.travelMode}</p>
                  <p>🧳 Travel Cost: ₹{place.travelCost}</p>
                  <p>🏨 Stay Cost: ₹{place.estimatedCost}</p>
                  <p>
                    💰 <strong>Total Budget:</strong> ₹
                    {place.estimatedCost + place.travelCost}
                  </p>
                  <button
                    className="view-button"
                    onClick={() => handleView(place.id)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="no-results">No results found based on your preferences.</p>
        )}
      </div>
    </div>
  );
};

export default ResultPage;
