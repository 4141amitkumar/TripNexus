import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/DetailsPage.css";

const DetailsPage = () => {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/destination/${placeId}`)
      .then((res) => res.json())
      .then((data) => {
        setPlace(data || {}); // fallback to empty object
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching place:", err);
        setLoading(false);
      });
  }, [placeId]);

  if (loading) return <p className="loading">Loading destination...</p>;
  if (!place || !place.name) return <p className="loading">Destination not found.</p>;

  const {
    name,
    image,
    description = "No description available.",
    highlights = [],
    hotels = [],
    emergencyContacts = [],
  } = place;

  return (
    <div className="details-wrapper">
      <button className="back-button" onClick={() => navigate(-1)}>
        &larr; Back
      </button>

      <h1 className="place-title">{name}</h1>
      <img className="place-image" src={image} alt={name} />

      <p className="description">{description}</p>

      {highlights.length > 0 && (
        <div className="info-box">
          <h3>Highlights:</h3>
          <ul>
            {highlights.map((item, index) => (
              <li key={index}>✅ {item}</li>
            ))}
          </ul>
        </div>
      )}

      {hotels.length > 0 && (
        <div className="info-box">
          <h3>Recommended Hotels:</h3>
          <ul>
            {hotels.map((hotel, index) => (
              <li key={index}>🏨 {hotel}</li>
            ))}
          </ul>
        </div>
      )}

      {emergencyContacts.length > 0 && (
        <div className="info-box">
          <h3>Emergency Contacts:</h3>
          <ul>
            {emergencyContacts.map((contact, index) => (
              <li key={index}>📞 {contact}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DetailsPage;