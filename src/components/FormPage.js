import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecommendations } from '../api/apiService';
import '../styles/FormPage.css';

function FormPage() {
    const [formData, setFormData] = useState({
        source: '',
        destination: '',
        budget: '',
        days: '',
        groupType: 'solo',
        interests: []
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleInterestChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            if (checked) {
                return { ...prev, interests: [...prev.interests, value] };
            } else {
                return { ...prev, interests: prev.interests.filter(i => i !== value) };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const results = await getRecommendations(formData);
            navigate('/results', { state: { recommendations: results } });
        } catch (err) {
            setError(err.response?.data?.message || 'Could not fetch recommendations.');
        }
    };

    // Add more interests as needed
    const interestOptions = ['adventure', 'culture', 'relaxation', 'beach', 'mountains', 'historical'];

    return (
        <div className="form-container">
            <h2>Find Your Perfect Trip</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <input name="source" value={formData.source} onChange={handleChange} placeholder="Source City" />
                    <input name="destination" value={formData.destination} onChange={handleChange} placeholder="Destination (Optional)" />
                </div>
                <div className="form-row">
                    <input name="budget" type="number" value={formData.budget} onChange={handleChange} placeholder="Max Budget (e.g., 50000)" />
                    <input name="days" type="number" value={formData.days} onChange={handleChange} placeholder="Number of Days (e.g., 5)" />
                </div>
                <div className="form-row">
                    <select name="groupType" value={formData.groupType} onChange={handleChange}>
                        <option value="solo">Solo</option>
                        <option value="couple">Couple</option>
                        <option value="family">Family</option>
                        <option value="friends">Friends</option>
                    </select>
                </div>
                <div className="interests-group">
                    <label>Interests:</label>
                    <div className="interests-checkboxes">
                        {interestOptions.map(interest => (
                            <label key={interest}>
                                <input type="checkbox" value={interest} onChange={handleInterestChange} />
                                {interest.charAt(0).toUpperCase() + interest.slice(1)}
                            </label>
                        ))}
                    </div>
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit">Get Recommendations</button>
            </form>
        </div>
    );
}

export default FormPage;

