// Import the database connection pool
const pool = require('./db');
// Import tags data from seed_data.py (or define it here)
const { tags, destinations, points_of_interest, poi_tags_relations } = require('./data/seed_data');

async function seedDatabase() {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('Connected to DB for seeding...');

        // --- Clear existing data (optional, useful during development) ---
        console.log('Clearing existing data...');
        // Order matters due to foreign key constraints
        await connection.query('DELETE FROM poi_tags');
        await connection.query('DELETE FROM user_interest_tags');
        await connection.query('DELETE FROM itinerary_items');
        await connection.query('DELETE FROM itineraries');
        await connection.query('DELETE FROM reviews');
        await connection.query('DELETE FROM points_of_interest');
        await connection.query('DELETE FROM trips');
        await connection.query('DELETE FROM destinations');
        await connection.query('DELETE FROM user_preferences');
        await connection.query('DELETE FROM users'); // Only if you manage users here, not just Firebase
        await connection.query('DELETE FROM tags');


        // --- Seed Tags ---
        console.log('Seeding tags...');
        const tagPlaceholders = tags.map(() => '(?)').join(', ');
        const tagValues = tags.map(tag => [tag.tag_name]);
        await connection.query(`INSERT INTO tags (tag_name) VALUES ${tagPlaceholders}`, tagValues.flat());
        console.log('Tags seeded.');

        // Fetch inserted tags to get their IDs
        const [insertedTags] = await connection.query('SELECT tag_id, tag_name FROM tags');
        const tagMap = insertedTags.reduce((map, tag) => {
            map[tag.tag_name] = tag.tag_id;
            return map;
        }, {});
        console.log('Tag Map:', tagMap);


        // --- Seed Destinations ---
        console.log('Seeding destinations...');
        const destPlaceholders = destinations.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
        const destValues = destinations.map(dest => [
            dest.name, dest.country, dest.region, dest.description,
            dest.best_time_to_visit, dest.latitude, dest.longitude
        ]);
        await connection.query(
            `INSERT INTO destinations (name, country, region, description, best_time_to_visit, latitude, longitude) VALUES ${destPlaceholders}`,
            destValues.flat()
        );
        console.log('Destinations seeded.');

        // Fetch inserted destinations to get their IDs
        const [insertedDestinations] = await connection.query('SELECT destination_id, name, country FROM destinations');
        const destinationMap = insertedDestinations.reduce((map, dest) => {
            map[`${dest.name}-${dest.country}`] = dest.destination_id; // Unique key
            return map;
        }, {});
        console.log('Destination Map:', destinationMap);


        // --- Seed Points of Interest ---
        console.log('Seeding points_of_interest...');
        const poiPlaceholders = points_of_interest.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
        const poiValues = points_of_interest.map(poi => {
             // Find the correct destination_id using the map
            const destKey = `${poi.destination_name}-${poi.destination_country}`;
            const destination_id = destinationMap[destKey];
            if (!destination_id) {
                console.warn(`Warning: Destination ID not found for POI "${poi.name}" with key "${destKey}". Skipping POI.`);
                return null; // Skip this POI if destination mapping fails
            }
             return [
                destination_id, poi.name, poi.category, poi.description, poi.address,
                poi.latitude, poi.longitude, poi.opening_hours,
                poi.avg_visit_duration_mins, poi.entry_fee
            ];
        }).filter(val => val !== null); // Filter out any skipped POIs

        if (poiValues.length > 0) {
             const validPoiPlaceholders = poiValues.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
            await connection.query(
                `INSERT INTO points_of_interest (destination_id, name, category, description, address, latitude, longitude, opening_hours, avg_visit_duration_mins, entry_fee) VALUES ${validPoiPlaceholders}`,
                poiValues.flat()
            );
            console.log(`${poiValues.length} Points of Interest seeded.`);
        } else {
             console.log('No valid Points of Interest to seed.');
        }


        // Fetch inserted POIs to get their IDs
        const [insertedPois] = await connection.query('SELECT poi_id, name FROM points_of_interest');
        const poiMap = insertedPois.reduce((map, poi) => {
            map[poi.name] = poi.poi_id; // Assuming POI names are unique for this seed data
            return map;
        }, {});
         console.log('POI Map:', poiMap);

        // --- Seed POI Tags (Junction Table) ---
        console.log('Seeding poi_tags...');
        const poiTagValues = [];
        poi_tags_relations.forEach(relation => {
            const poi_id = poiMap[relation.poi_name];
            const tag_id = tagMap[relation.tag_name];
            if (poi_id && tag_id) {
                poiTagValues.push([poi_id, tag_id]);
            } else {
                 console.warn(`Warning: Could not map relation for POI "${relation.poi_name}" and Tag "${relation.tag_name}". Skipping.`);
            }
        });

        if (poiTagValues.length > 0) {
            const poiTagPlaceholders = poiTagValues.map(() => '(?, ?)').join(', ');
            await connection.query(
                `INSERT INTO poi_tags (poi_id, tag_id) VALUES ${poiTagPlaceholders}`,
                poiTagValues.flat()
            );
            console.log(`${poiTagValues.length} POI tag relationships seeded.`);
        } else {
             console.log('No valid POI tag relationships to seed.');
        }

        console.log('Database seeding completed successfully!');

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        if (connection) {
            connection.release(); // Release the connection back to the pool
            console.log('Connection released.');
        }
        await pool.end(); // Close the pool after seeding
        console.log('Pool closed.');
    }
}

// Run the seeding function
seedDatabase();
