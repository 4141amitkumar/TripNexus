CREATE TABLE users (
    user_id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    age INT CHECK (age >= 0 AND age <= 120),
    gender ENUM('Male', 'Female', 'Other', 'Prefer not to say') DEFAULT 'Prefer not to say',
    phone VARCHAR(20),
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    preferred_budget_min DECIMAL(10, 2),
    preferred_budget_max DECIMAL(10, 2),
    mobility_level INT CHECK (mobility_level BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Tourist Types
CREATE TABLE tourist_types (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) UNIQUE NOT NULL,
    min_group_size INT DEFAULT 1,
    max_group_size INT DEFAULT 10,
    typical_budget_multiplier DECIMAL(3,2) DEFAULT 1.0,
    activity_preference_weight DECIMAL(3,2) DEFAULT 1.0
);

-- Destination Categories
CREATE TABLE destination_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    physical_demand_level INT CHECK (physical_demand_level BETWEEN 1 AND 5),
    best_season_start INT CHECK (best_season_start BETWEEN 1 AND 12),
    best_season_end INT CHECK (best_season_end BETWEEN 1 AND 12),
    romance_score INT CHECK (romance_score BETWEEN 1 AND 10),
    family_friendliness INT CHECK (family_friendliness BETWEEN 1 AND 10),
    adventure_level INT CHECK (adventure_level BETWEEN 1 AND 10),
    cultural_richness INT CHECK (cultural_richness BETWEEN 1 AND 10)
);

-- Destinations
CREATE TABLE destinations (
    destination_id CHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    country VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    category_id INT,
    overall_rating DECIMAL(3,2) CHECK (overall_rating >= 0 AND overall_rating <= 5),
    total_reviews INT DEFAULT 0,
    average_visit_duration_hours INT,
    entry_fee DECIMAL(10,2) DEFAULT 0,
    altitude_meters INT,
    temperature_avg_summer DECIMAL(5,2),
    temperature_avg_winter DECIMAL(5,2),
    is_accessible_elderly BOOLEAN DEFAULT FALSE,
    is_accessible_disabled BOOLEAN DEFAULT FALSE,
    crowd_level INT CHECK (crowd_level BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (category_id) REFERENCES destination_categories(category_id)
);

-- Hotels
CREATE TABLE hotels (
    hotel_id CHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    destination_id CHAR(36),
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    star_rating INT CHECK (star_rating BETWEEN 1 AND 5),
    guest_rating DECIMAL(3,2) CHECK (guest_rating >= 0 AND guest_rating <= 5),
    total_reviews INT DEFAULT 0,
    price_per_night_min DECIMAL(10,2),
    price_per_night_max DECIMAL(10,2),
    distance_from_destination_km DECIMAL(8,3),
    amenities TEXT,
    is_couple_friendly BOOLEAN DEFAULT TRUE,
    is_family_friendly BOOLEAN DEFAULT TRUE,
    has_accessibility_features BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (destination_id) REFERENCES destinations(destination_id)
);

-- User Trips
CREATE TABLE user_trips (
    trip_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    destination_id CHAR(36),
    tourist_type_id INT,
    travel_date DATE NOT NULL,
    duration_days INT CHECK (duration_days > 0),
    total_spent DECIMAL(12,2),
    group_size INT DEFAULT 1,
    user_rating INT CHECK (user_rating BETWEEN 1 AND 5),
    user_review TEXT,
    weather_during_visit VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (destination_id) REFERENCES destinations(destination_id),
    FOREIGN KEY (tourist_type_id) REFERENCES tourist_types(type_id)
);

-- User Preferences
CREATE TABLE user_preferences (
    preference_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    category_id INT,
    preference_weight DECIMAL(3,2) CHECK (preference_weight BETWEEN 0 AND 1),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(user_id, category_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (category_id) REFERENCES destination_categories(category_id)
);

-- Destination Proximity
CREATE TABLE destination_proximity (
    proximity_id CHAR(36) PRIMARY KEY,
    destination_a CHAR(36),
    destination_b CHAR(36),
    distance_km DECIMAL(8,3) NOT NULL,
    travel_time_hours DECIMAL(5,2),
    transportation_type VARCHAR(50),
    cost_estimate DECIMAL(10,2),
    UNIQUE(destination_a, destination_b),
    CHECK (destination_a <> destination_b),
    FOREIGN KEY (destination_a) REFERENCES destinations(destination_id),
    FOREIGN KEY (destination_b) REFERENCES destinations(destination_id)
);

-- Seasonal Weather
CREATE TABLE seasonal_weather (
    weather_id CHAR(36) PRIMARY KEY,
    destination_id CHAR(36),
    month INT CHECK (month BETWEEN 1 AND 12),
    avg_temperature DECIMAL(5,2),
    avg_rainfall_mm DECIMAL(7,2),
    humidity_percent INT CHECK (humidity_percent BETWEEN 0 AND 100),
    weather_score INT CHECK (weather_score BETWEEN 1 AND 10),
    is_peak_season BOOLEAN DEFAULT FALSE,
    crowd_multiplier DECIMAL(3,2) DEFAULT 1.0,
    UNIQUE(destination_id, month),
    FOREIGN KEY (destination_id) REFERENCES destinations(destination_id)
);

-- User Search History
CREATE TABLE user_search_history (
    search_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    search_query TEXT,
    filters_applied TEXT,
    results_count INT,
    clicked_destinations TEXT,
    search_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ML Recommendation Features
CREATE TABLE user_recommendation_features (
    feature_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    age_group VARCHAR(20),
    spending_pattern VARCHAR(20),
    travel_frequency VARCHAR(20),
    adventure_score DECIMAL(3,2),
    culture_score DECIMAL(3,2),
    relaxation_score DECIMAL(3,2),
    romance_score DECIMAL(3,2),
    family_score DECIMAL(3,2),
    last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Indexes
CREATE INDEX idx_destinations_rating ON destinations(overall_rating DESC);
CREATE INDEX idx_destinations_category ON destinations(category_id);
CREATE INDEX idx_hotels_rating ON hotels(guest_rating DESC);
CREATE INDEX idx_hotels_price ON hotels(price_per_night_min);
CREATE INDEX idx_user_trips_user_date ON user_trips(user_id, travel_date DESC);
CREATE INDEX idx_seasonal_weather_month ON seasonal_weather(month, weather_score DESC);
CREATE INDEX idx_user_search_timestamp ON user_search_history(user_id, search_timestamp DESC);

-- Composite Indexes
CREATE INDEX idx_destinations_category_rating ON destinations(category_id, overall_rating DESC);
CREATE INDEX idx_hotels_destination_rating ON hotels(destination_id, guest_rating DESC);
CREATE INDEX idx_proximity_distance ON destination_proximity(destination_a, distance_km);

-- Seed Tourist Types
INSERT INTO tourist_types (type_name, min_group_size, max_group_size, typical_budget_multiplier) VALUES
('solo', 1, 1, 0.8),
('couple', 2, 2, 1.2),
('family', 3, 8, 1.5),
('friends', 2, 10, 0.9);

-- Seed Destination Categories
INSERT INTO destination_categories (category_name, physical_demand_level, best_season_start, best_season_end, romance_score, family_friendliness, adventure_level, cultural_richness) VALUES
('Mountain Adventures', 5, 4, 10, 7, 6, 10, 7),
('Beach Paradise', 2, 11, 3, 9, 10, 4, 4),
('Wildlife Safari', 4, 11, 4, 5, 7, 9, 6),
('Romantic Getaway', 2, 10, 3, 10, 8, 3, 8),
('Extreme Adventures', 5, 10, 4, 4, 3, 10, 5),
('Spiritual Journey', 2, 10, 3, 6, 8, 2, 10),
('Heritage Exploration', 3, 10, 3, 7, 8, 4, 10),
('Luxury / Resort', 1, 1, 12, 8, 9, 2, 6),
('Cultural / Festival', 2, 10, 3, 6, 8, 5, 10),
