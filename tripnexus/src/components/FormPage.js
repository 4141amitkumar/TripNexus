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
    type: "Mountain",
    duration: "",
  });

  const [locationCoords, setLocationCoords] = useState(null);
  const [success, setSuccess] = useState(false);
  const autocompleteRef = useRef(null);

  const fetchCityFromCoords = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      const {
        city,
        town,
        village,
        municipality,
        county,
        suburb,
        neighbourhood,
        state,
      } = data.address;

      const locality =
        city || town || village || municipality || county || suburb || neighbourhood || "Unknown";

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

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.location) {
      alert("Please enter your departure point manually or enable location access.");
      return;
    }

    try {
      // Save locally
      localStorage.setItem("tripUserData", JSON.stringify(formData));
      if (locationCoords) {
        localStorage.setItem("userLocation", JSON.stringify(locationCoords));
      }

      // Send to backend
      const res = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setFormData((prev) => ({ ...prev, name: "", email: "" }));
      } else {
        alert("Failed to save user on server.");
      }

      navigate("/results");
    } catch (err) {
      console.error("Error saving user:", err);
      alert("Error saving user data.");
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

        setFormData((prev) => ({
          ...prev,
          location: place.formatted_address,
        }));

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

          {/* Name */}
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder={placeholders.name}
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder={placeholders.email}
            />
          </div>

          {/* Location with Autocomplete */}
          <div className="form-group">
            <label>Departure Point:</label>
            <Autocomplete
              onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
              onPlaceChanged={handlePlaceChanged}
            >
              <input
                type="text"
                id="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter your city"
              />
            </Autocomplete>
          </div>

          {/* Other inputs */}
          {[
            { id: "age", label: "Age", type: "number" },
            { id: "budget", label: "Budget (₹)", type: "number" },
            { id: "duration", label: "Trip Duration (days)", type: "number" },
          ].map(({ id, label, type }) => (
            <div className="form-group" key={id}>
              <label>{label}:</label>
              <input
                type={type}
                id={id}
                required
                value={formData[id]}
                onChange={handleChange}
                placeholder={placeholders[id] || ""}
              />
            </div>
          ))}

          {/* Select dropdowns */}
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
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ].map((m) => (
                <option key={m}>{m}</option>
              ))}
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

          <button className="submit-button" type="submit">Find Destinations</button>
        </form>
        {success && <p>✅ User saved successfully!</p>}
      </div>
    </LoadScript>
  );
};

export default FormPage;
