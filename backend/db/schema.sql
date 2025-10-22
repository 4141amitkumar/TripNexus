-- Database schema for TripNexus

-- Users table - Stores basic user information, links to Firebase Auth
CREATE TABLE users (
    user_id VARCHAR(255) PRIMARY KEY, -- Firebase Auth UID
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Destinations table - Cities, regions, countries
CREATE TABLE destinations (
    destination_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    region VARCHAR(100), -- e.g., North India, South East Asia
    description TEXT,
    best_time_to_visit VARCHAR(255), -- e.g., "October to March"
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    UNIQUE(name, country) -- Ensure destination names are unique within a country
);

-- Points of Interest (POIs) table - Museums, landmarks, restaurants etc.
CREATE TABLE points_of_interest (
    poi_id INT AUTO_INCREMENT PRIMARY KEY,
    destination_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- e.g., Museum, Restaurant, Park, Landmark, Activity
    description TEXT,
    address VARCHAR(512),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    opening_hours VARCHAR(255), -- Store as text for simplicity, could be more structured
    avg_visit_duration_mins INT, -- Average duration in minutes
    entry_fee DECIMAL(10, 2),
    website VARCHAR(255),
    FOREIGN KEY (destination_id) REFERENCES destinations(destination_id) ON DELETE CASCADE,
    INDEX idx_poi_destination (destination_id),
    INDEX idx_poi_category (category)
);

-- Tags/Interests table - To categorize POIs and User Preferences
CREATE TABLE tags (
    tag_id INT AUTO_INCREMENT PRIMARY KEY,
    tag_name VARCHAR(50) UNIQUE NOT NULL -- e.g., History, Adventure, Foodie, Beach, Hiking, Art
);

-- Junction table for POIs and Tags (Many-to-Many)
CREATE TABLE poi_tags (
    poi_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (poi_id, tag_id),
    FOREIGN KEY (poi_id) REFERENCES points_of_interest(poi_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
);

-- User Preferences table
CREATE TABLE user_preferences (
    user_id VARCHAR(255) PRIMARY KEY,
    travel_style ENUM('Budget', 'Mid-range', 'Luxury'),
    pace ENUM('Relaxed', 'Moderate', 'Packed'),
    -- Add other preferences as needed
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Junction table for User Preferences and Tags (Many-to-Many for interests)
CREATE TABLE user_interest_tags (
    user_id VARCHAR(255) NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (user_id, tag_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
);

-- Trips table - Represents a user's planned trip
CREATE TABLE trips (
    trip_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    destination_id INT NOT NULL, -- Main destination, could be extended for multi-destination
    trip_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(destination_id) ON DELETE RESTRICT, -- Prevent deleting destination if trips exist
    INDEX idx_trip_user (user_id)
);

-- Itineraries table - Represents a single day within a trip
CREATE TABLE itineraries (
    itinerary_id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    day_number INT NOT NULL, -- e.g., Day 1, Day 2
    date DATE NOT NULL,
    notes TEXT, -- User notes for the day
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,
    UNIQUE(trip_id, day_number), -- Each day number must be unique within a trip
    UNIQUE(trip_id, date) -- Each date must be unique within a trip
);

-- Itinerary Items table - Links POIs/Activities to specific times on an itinerary day
CREATE TABLE itinerary_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    itinerary_id INT NOT NULL,
    poi_id INT, -- Can be NULL if it's a custom note/activity without a specific POI
    start_time TIME,
    end_time TIME,
    custom_activity_description TEXT, -- For items not linked to a POI
    notes TEXT, -- User notes specific to this item
    FOREIGN KEY (itinerary_id) REFERENCES itineraries(itinerary_id) ON DELETE CASCADE,
    FOREIGN KEY (poi_id) REFERENCES points_of_interest(poi_id) ON DELETE SET NULL, -- Allow keeping item if POI deleted
    INDEX idx_item_itinerary (itinerary_id)
);

-- Reviews/Ratings table
CREATE TABLE reviews (
   review_id INT AUTO_INCREMENT PRIMARY KEY,
   poi_id INT, -- Can be NULL if review is for destination/accommodation etc.
   -- destination_id INT, -- Add if allowing reviews for destinations
   user_id VARCHAR(255) NOT NULL,
   rating INT CHECK (rating >= 1 AND rating <= 5), -- Rating from 1 to 5
   comment TEXT,
   review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (poi_id) REFERENCES points_of_interest(poi_id) ON DELETE CASCADE,
   FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
   INDEX idx_review_poi (poi_id),
   INDEX idx_review_user (user_id)
);

-- Add more tables as needed (e.g., accommodations, transport_options, etc.)
