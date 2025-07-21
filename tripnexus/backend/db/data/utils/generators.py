import random
import pandas as pd
from faker import Faker
import os

fake = Faker('en_US')
Faker.seed(42)
random.seed(42)

def generate_users(n=100):
    travel_types = ['Solo', 'Family', 'Friends', 'Couple']
    genders = ['Male', 'Female', 'Other', 'Prefer not to say']
    months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]
    types = [
        "Mountain Adventures", "Beach Paradise", "Wildlife Safari", "Romantic Getaway",
        "Extreme Adventures", "Spiritual Journey", "Heritage Exploration",
        "Luxury / Resort", "Cultural / Festival", "Nature Retreat"
    ]
    users = []

    for _ in range(n):
        users.append({
            "name": fake.name(),
            "email": fake.unique.email(),
            "location": fake.city(),
            "age": random.randint(18, 60),
            "gender": random.choice(genders),
            "budget": random.randint(5000, 100000),
            "tripType": random.choice(travel_types),
            "month": random.choice(months),
            "type": random.choice(types),
            "duration": random.randint(2, 15)
        })
    return users

def generate_destinations(n=100):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    cities_path = os.path.join(base_dir, '../static/cities_india.csv')
    if not os.path.exists(cities_path):
        raise FileNotFoundError("cities_india.csv not found in static directory")

    cities_df = pd.read_csv(cities_path)
    categories = [
        "Mountain Adventures", "Beach Paradise", "Wildlife Safari", "Romantic Getaway",
        "Extreme Adventures", "Spiritual Journey", "Heritage Exploration",
        "Luxury / Resort", "Cultural / Festival", "Nature Retreat"
    ]
    months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]
    destinations = []

    for _ in range(n):
        city = cities_df.sample().iloc[0]
        destinations.append({
            "name": city['City'],
            "state": city['State'],
            "description": fake.text(max_nb_chars=200),
            "category": random.choice(categories),
            "best_month": random.choice(months),
            "rating": round(random.uniform(3.0, 5.0), 1)
        })
    return destinations

def generate_hotels(destinations, n=200):
    hotels = []
    for _ in range(n):
        dest = random.choice(destinations)
        hotels.append({
            "destination_name": dest['name'],
            "hotel_name": fake.company(),
            "price_per_night": random.randint(1000, 15000),
            "rating": round(random.uniform(3.0, 5.0), 1),
            "amenities": ', '.join(random.sample(
                ['WiFi', 'AC', 'Parking', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Gym'], 4))
        })
    return hotels

def save_to_csv(data, filename):
    # Ensure output directory exists
    output_dir = os.path.dirname(os.path.abspath(filename))
    os.makedirs(output_dir, exist_ok=True)
    df = pd.DataFrame(data)
    df.to_csv(filename, index=False)

if __name__ == "__main__":
    print("Generating sample data...")

    users = generate_users()
    destinations = generate_destinations()
    hotels = generate_hotels(destinations)


    # Use absolute path for output directory
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.abspath(os.path.join(base_dir, '../output'))
    save_to_csv(users, os.path.join(output_dir, 'users.csv'))
    save_to_csv(destinations, os.path.join(output_dir, 'destinations.csv'))
    save_to_csv(hotels, os.path.join(output_dir, 'hotels.csv'))

    print("Data saved to 'output/' directory")