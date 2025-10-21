import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GoogleMap, LoadScript, MarkerF } from "@react-google-maps/api";
import "../styles/DetailsPage.css";

const libraries = ["places"];

const DetailsPage = () => {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/destination/${placeId}`)
      .then((res) => res.json())
      .then((data) => {
        setPlace(data || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching place:", err);
        setLoading(false);
      });
  }, [placeId]);

  if (loading) return <p className="loading">Loading destination details...</p>;
  if (!place) return <p className="loading">Destination not found.</p>;

  const mapContainerStyle = {
    width: "100%",
    height: "300px",
    borderRadius: "12px",
    marginBottom: "20px",
  };

  const center = {
    lat: place.latitude,
    lng: place.longitude,
  };

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <div 
        className="details-page-wrapper"
        style={{ backgroundImage: `url(${place.image})` }}
      >
        <header className="details-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            &larr; Back to Results
          </button>
          <h1 className="place-title">{place.name}</h1>
        </header>

        <div className="details-grid">
          <main className="main-content">
            <img className="place-image" src={place.image} alt={place.name} />
            <p className="description">{place.description}</p>
          </main>

          <aside className="sidebar-content">
            <div className="map-section info-box">
               <h3>Location</h3>
               <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={12}
                center={center}
               >
                <MarkerF position={center} />
               </GoogleMap>
            </div>
            
            {place.highlights?.length > 0 && (
              <div className="info-box">
                <h3>Highlights</h3>
                <ul className="highlights-list">
                  {place.highlights.map((item, index) => (
                    <li key={index}>
                      <span role="img" aria-label="highlight">✅</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {place.hotels?.length > 0 && (
              <div className="info-box">
                <h3>Where to Stay</h3>
                <ul className="hotel-list">
                  {place.hotels.map((hotel, index) => (
                    <li key={index}>
                      <div className="hotel-info">
                        <span className="hotel-name">🏨 {hotel.name}</span>
                        <span className="hotel-rating">⭐ {hotel.rating}/5</span>
                      </div>
                      <span className="hotel-price">{hotel.price}/night</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {place.emergencyContacts?.length > 0 && (
              <div className="info-box">
                <h3>Emergency Contacts</h3>
                <ul className="contact-list">
                  {place.emergencyContacts.map((contact, index) => (
                    <li key={index}>
                      <span>📞 {contact.name}:</span>
                      <a href={`tel:${contact.number}`}>{contact.number}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </LoadScript>
  );
};

export default DetailsPage;

