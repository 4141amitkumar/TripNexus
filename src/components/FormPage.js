import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LoadScript, Autocomplete } from "@react-google-maps/api";
import "../styles/FormPage.css";

const libraries = ["places"];
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const FormPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    age: "",
    gender: "Male",
    budget: "",
    tripType: "Solo",
    month: "January",
    type: "Mountain Adventures",
    duration: "",
  });

  const [locationCoords, setLocationCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const autocompleteRef = useRef(null);
  const navigate = useNavigate();

  // Get city name from coordinates
  const fetchCityFromCoords = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      const { city, town, village, municipality, county, suburb, neighbourhood, state } = data.address;
      const locality = city || town || village || municipality || county || suburb || neighbourhood || "Unknown";
      const locationText = [locality, state].filter(Boolean).join(", ");
      setFormData((prev) => ({ ...prev, location: locationText }));
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocationCoords(coords);
        localStorage.setItem("userLocation", JSON.stringify(coords));
        fetchCityFromCoords(coords.lat, coords.lng);
      },
      (error) => {
        console.error("Location access denied", error);
        alert("Location not detected. You can type your departure point manually.");
      }
    );
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.location) {
      alert("Please enter your departure point manually or enable location access.");
      return;
    }

    setLoading(true);

    try {
      // Save locally
      localStorage.setItem("tripUserData", JSON.stringify(formData));
      if (locationCoords) {
        localStorage.setItem("userLocation", JSON.stringify(locationCoords));
      }

      // Save to backend users table
      const API_URL = process.env.REACT_APP_API_URL;

// Save to backend users table
await fetch(`${API_URL}/api/users`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: formData.email,
    first_name: formData.name.split(" ")[0] || formData.name,
    last_name: formData.name.split(" ")[1] || "",
    age: formData.age,
    gender: formData.gender,
  }),
});

// Call recommend API
const travel_month_num = new Date(`${formData.month} 1, 2025`).getMonth() + 1;
const recommendRes = await fetch(`${API_URL}/api/recommend`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    departure_lat: locationCoords?.lat,
    departure_lng: locationCoords?.lng,
    age: formData.age,
    gender: formData.gender,
    budget: formData.budget,
    tourist_type: formData.tripType,
    travel_month_num,
    preferred_type: formData.type,
    duration_days: formData.duration,
  }),
});


      const recommendations = await recommendRes.json();
      localStorage.setItem("recommendations", JSON.stringify(recommendations));

      navigate("/results");
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Error fetching recommendations.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.formatted_address && place.geometry) {
        const coords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        setFormData((prev) => ({ ...prev, location: place.formatted_address }));
        setLocationCoords(coords);
        localStorage.setItem("userLocation", JSON.stringify(coords));
      }
    }
  };

  const placeholders = {
    name: "Enter your name",
    email: "Enter your email",
    age: "Enter your age",
    budget: "Mention your budget in ₹",
    duration: "Enter your trip duration",
  };

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={libraries}>
      <div className="form-wrapper">
        <h1 className="title">TripNexus: Smart Travel Planner</h1>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label>Name:</label>
            <input type="text" id="name" required value={formData.name} onChange={handleChange} placeholder={placeholders.name} />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input type="email" id="email" required value={formData.email} onChange={handleChange} placeholder={placeholders.email} />
          </div>

          <div className="form-group">
            <label>Departure Point:</label>
            <Autocomplete onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)} onPlaceChanged={handlePlaceChanged}>
              <input type="text" id="location" required value={formData.location} onChange={handleChange} placeholder="Enter your city" />
            </Autocomplete>
          </div>

          {["age", "budget", "duration"].map((id) => (
            <div className="form-group" key={id}>
              <label>{id.charAt(0).toUpperCase() + id.slice(1)}:</label>
              <input type="number" id={id} required value={formData[id]} onChange={handleChange} placeholder={placeholders[id]} />
            </div>
          ))}

          <div className="form-group">
            <label>Gender:</label>
            <select id="gender" onChange={handleChange} value={formData.gender}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
              <option>Prefer not to say</option>
            </select>
          </div>

          <div className="form-group">
            <label>Trip Type:</label>
            <select id="tripType" onChange={handleChange} value={formData.tripType}>
              <option>Solo</option>
              <option>Family</option>
              <option>Friends</option>
              <option>Couple</option>
            </select>
          </div>

          <div className="form-group">
            <label>Month of Travel:</label>
            <select id="month" onChange={handleChange} value={formData.month}>
              {[
                "January","February","March","April","May","June",
                "July","August","September","October","November","December"
              ].map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Preferred Type:</label>
            <select id="type" onChange={handleChange} value={formData.type}>
              <option>Mountain Adventures</option>
              <option>Beach Paradise</option>
              <option>Wildlife Safari</option>
              <option>Romantic Getaway</option>
              <option>Extreme Adventures</option>
              <option>Spiritual Journey</option>
              <option>Heritage Exploration</option>
              <option>Luxury / Resort</option>
              <option>Cultural / Festival</option>
              <option>Nature Retreat</option>
            </select>
          </div>

          <button className="submit-button" type="submit" disabled={loading}>
            {loading ? "Finding..." : "Find Destinations"}
          </button>
        </form>
      </div>
    </LoadScript>
  );
};

export default FormPage;
