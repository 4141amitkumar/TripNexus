# TripNexus - Smart Travel Recommendation System (DBMS Project)

A smart database-driven system that recommends best tourist destinations based on:

- User budget, age, travel type (solo/family/friends)
- Month of travel
- Nearby tourist spots
- Hotel and transport recommendations
- Emergency contact for location

## Database Schema
- 6 Tables: Users, Locations, Hotels, TouristSpots, Transport, EmergencyContacts
- Normalized Design
- Foreign key constraints

## Recommendation Logic
- Month + Budget filter
- Join queries for location-wise details
- Cheapest transport mode
- Nearby places based on distance
- ER diagram attached

## Files
- `schema.sql`: All table definitions
- `insert_data.sql`: Sample dataset
- `recommendation_queries.sql`: All logic queries
- `erd.png`: ER diagram

## Tech Stack
- MySQL (via XAMPP/phpMyAdmin)
- SQL joins, filters, constraints
- (Optional) HTML/CSS frontend for demo

## Status
Database setup complete  
Logic layer ready  
Frontend in progress
