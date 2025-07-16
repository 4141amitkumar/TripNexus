import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/FormPage.css";

const FormPage = () => {
  const [formData, setFormData] = useState({
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

  useEffect(() => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setLocationCoords(coords);
      localStorage.setItem("userLocation", JSON.stringify(coords));
    },
    (error) => {
      console.error("Location access denied", error);
      alert("Please allow location access for better recommendations.");
    }
  );
}, []);


  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!locationCoords) {
      alert("Location not detected! Please allow location access.");
      return;
    }
    localStorage.setItem("userLocation", JSON.stringify(locationCoords));
    localStorage.setItem("tripUserData", JSON.stringify(formData));
    navigate("/results");
  };

  return (
    <div className="form-wrapper">
      <h1 className="title">TripNexus: Smart Travel Planner</h1>
      <form onSubmit={handleSubmit} className="form-grid">
        {[
          { id: "location", label: "Current Location" },
          { id: "age", label: "Age", type: "number" },
          { id: "budget", label: "Budget (₹)", type: "number" },
          { id: "duration", label: "Trip Duration (days)", type: "number" },
        ].map(({ id, label, type }) => (
          <div className="form-group" key={id}>
            <label>{label}:</label>
            <input
              type={type || "text"}
              id={id}
              required
              value={formData[id]}
              onChange={handleChange}
            />
          </div>
        ))}

        <div className="form-group">
          <label>Gender:</label>
          <select id="gender" onChange={handleChange} value={formData.gender}>
            <option>Male</option>
            <option>Female</option>
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
            {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Preferred Type:</label>
          <select id="type" onChange={handleChange} value={formData.type}>
            <option>Mountain</option>
            <option>Beach</option>
            <option>Forest / Wildlife</option>
            <option>Adventure</option>
            <option>Religious / Spiritual</option>
            <option>Historical / Heritage</option>
            <option>Luxury / Resort</option>
            <option>Cultural / Festival</option>
            <option>Eco / Nature</option>
            <option>Honeymoon / Romantic</option>
          </select>
        </div>

        <button className="submit-button" type="submit">Find Destinations</button>
      </form>
    </div>
  );
};

export default FormPage;
