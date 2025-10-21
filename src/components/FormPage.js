import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { planTrip } from '../api/apiService';
import '../styles/FormPage.css';
import { toast } from 'react-toastify';


const FormPage = () => {
    const [startCity, setStartCity] = useState('');
    const [endCity, setEndCity] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [budget, setBudget] = useState('');
    const [preferences, setPreferences] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handlePreferenceChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setPreferences([...preferences, value]);
        } else {
            setPreferences(preferences.filter((pref) => pref !== value));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const tripData = {
            startCity,
            endCity,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            budget: Number(budget),
            preferences,
        };
        
        try {
            const response = await planTrip(tripData);
            setLoading(false);
            toast.success("Trip plan generated successfully!");
            // Navigate to the results page with the new trip's ID
            navigate(`/trip/${response.data.tripId}`);
        } catch (error) {
            setLoading(false);
            console.error('Failed to plan trip:', error);
            // Error toast is handled by apiService interceptor
        }
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit} className="trip-form">
                <h2>Plan Your Next Adventure</h2>
                <div className="form-row">
                    <div className="form-group">
                        <label>Starting City</label>
                        <input
                            type="text"
                            value={startCity}
                            onChange={(e) => setStartCity(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Destination City</label>
                        <input
                            type="text"
                            value={endCity}
                            onChange={(e) => setEndCity(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Start Date</label>
                        <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />
                    </div>
                    <div className="form-group">
                        <label>End Date</label>
                        <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} />
                    </div>
                </div>

                <div className="form-group">
                    <label>Budget (in USD)</label>
                    <input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="e.g., 1000"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Preferences</label>
                    <div className="preferences-group">
                       <label><input type="checkbox" value="sightseeing" onChange={handlePreferenceChange} /> Sightseeing</label>
                       <label><input type="checkbox" value="adventure" onChange={handlePreferenceChange} /> Adventure</label>
                       <label><input type="checkbox" value="relaxation" onChange={handlePreferenceChange} /> Relaxation</label>
                       <label><input type="checkbox" value="culture" onChange={handlePreferenceChange} /> Culture</label>
                       <label><input type="checkbox" value="foodie" onChange={handlePreferenceChange} /> Foodie</label>
                    </div>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Generating Plan...' : 'Generate My Trip'}
                </button>
            </form>
        </div>
    );
};

export default FormPage;
