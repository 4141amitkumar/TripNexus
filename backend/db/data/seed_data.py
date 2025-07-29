import csv
import mysql.connector
import uuid

# Database connection
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="97951",
    database="tripnexus"
)
cursor = conn.cursor()

# Helper: Get category_id from category name, insert if not exists
def get_category_id(category_name):
    cursor.execute("SELECT category_id FROM destination_categories WHERE category_name = %s", (category_name,))
    result = cursor.fetchone()
    if result:
        return result[0]
    cursor.execute("INSERT INTO destination_categories (category_name) VALUES (%s)", (category_name,))
    conn.commit()
    return cursor.lastrowid

# Seed Destinations
with open('backend/db/output/destinations.csv', newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        category_id = get_category_id(row['category'])
        cursor.execute("""
            INSERT INTO destinations (state, city, latitude, longitude, category_id, overall_rating, total_reviews, is_accessible, crowd_level, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            row['state'],
            row.get('city', row['name']),  # use name as city if missing
            0.0, 0.0,                      # latitude, longitude default
            category_id,
            float(row['rating']),
            0,                             # total_reviews default
            1,                             # is_accessible
            1,                             # crowd_level
            1                              # is_active
        ))

# Seed Hotels
with open('backend/db/output/hotels.csv', newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        cursor.execute("""
            INSERT INTO hotels (hotel_id, name, latitude, longitude, star_rating, guest_rating, total_reviews, price_per_night_min, price_per_night_max, is_couple_friendly, is_family_friendly, has_accessibility_features, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            str(uuid.uuid4()), row['name'], 0.0, 0.0, 3, 4.0, 0, 2000, 5000, 1, 1, 1, 1
        ))

# Seed Users
with open('backend/db/output/users.csv', newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        cursor.execute("""
            INSERT INTO users (user_id, email, password_hash, first_name, last_name, is_active)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            str(uuid.uuid4()), row['email'], "hashed_password", row['first_name'], row['last_name'], 1
        ))

conn.commit()
cursor.close()
conn.close()
print("Seeding completed!")
