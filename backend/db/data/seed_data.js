// Sample data for seeding the database

const tags = [
    { tag_name: 'History' },
    { tag_name: 'Adventure' },
    { tag_name: 'Foodie' },
    { tag_name: 'Beach' },
    { tag_name: 'Mountains' },
    { tag_name: 'Art & Culture' },
    { tag_name: 'Nature' },
    { tag_name: 'Nightlife' },
    { tag_name: 'Shopping' },
    { tag_name: 'Family Friendly' },
];

const destinations = [
    {
        name: 'Jaipur', country: 'India', region: 'North India',
        description: 'The Pink City, known for its palaces and forts.',
        best_time_to_visit: 'October to March',
        latitude: 26.9124, longitude: 75.7873
    },
    {
        name: 'Goa', country: 'India', region: 'West India',
        description: 'Famous for its beaches, nightlife, and Portuguese architecture.',
        best_time_to_visit: 'November to February',
        latitude: 15.2993, longitude: 74.1240
    },
    {
        name: 'Shimla', country: 'India', region: 'North India',
        description: 'A popular hill station in the Himalayas, known for its colonial architecture and scenic views.',
        best_time_to_visit: 'March to June, October to November',
        latitude: 31.1048, longitude: 77.1734
    }
];

const points_of_interest = [
    // Jaipur POIs
    {
        destination_name: 'Jaipur', destination_country: 'India', // Used for mapping
        name: 'Amber Fort', category: 'Landmark',
        description: 'A magnificent fort complex built with red sandstone and marble.',
        address: 'Devisinghpura, Amer, Jaipur, Rajasthan 302001',
        latitude: 26.9855, longitude: 75.8513, opening_hours: '8:00 AM - 5:30 PM',
        avg_visit_duration_mins: 180, entry_fee: 500.00
    },
    {
        destination_name: 'Jaipur', destination_country: 'India',
        name: 'Hawa Mahal', category: 'Landmark',
        description: 'Palace of Winds, known for its unique five-story facade with 953 windows.',
        address: 'Hawa Mahal Rd, Badi Choupad, J.D.A. Market, Pink City, Jaipur, Rajasthan 302002',
        latitude: 26.9239, longitude: 75.8267, opening_hours: '9:00 AM - 4:30 PM',
        avg_visit_duration_mins: 60, entry_fee: 200.00
    },
     {
        destination_name: 'Jaipur', destination_country: 'India',
        name: 'Laxmi Misthan Bhandar (LMB)', category: 'Restaurant',
        description: 'Iconic restaurant in Jaipur famous for traditional Rajasthani sweets and snacks.',
        address: 'Shop No. 98, 99, Johari Bazar Rd, Bapu Bazar, Jaipur, Rajasthan 302003',
        latitude: 26.9190, longitude: 75.8242, opening_hours: '8:00 AM - 11:00 PM',
        avg_visit_duration_mins: 60, entry_fee: null
    },
    // Goa POIs
    {
        destination_name: 'Goa', destination_country: 'India',
        name: 'Baga Beach', category: 'Beach',
        description: 'One of the most popular beaches in North Goa, known for water sports and nightlife.',
        address: 'Baga, Goa',
        latitude: 15.5562, longitude: 73.7517, opening_hours: 'Open 24 hours',
        avg_visit_duration_mins: 120, entry_fee: null
    },
    {
        destination_name: 'Goa', destination_country: 'India',
        name: 'Basilica of Bom Jesus', category: 'Landmark',
        description: 'A UNESCO World Heritage site holding the mortal remains of St. Francis Xavier.',
        address: 'Old Goa Rd, Bainguinim, Goa 403402',
        latitude: 15.5009, longitude: 73.9116, opening_hours: '9:00 AM - 6:30 PM (Sun from 10:30 AM)',
        avg_visit_duration_mins: 60, entry_fee: null
    },
    // Shimla POIs
    {
        destination_name: 'Shimla', destination_country: 'India',
        name: 'The Ridge', category: 'Landmark',
        description: 'A large open space in the heart of Shimla, offering panoramic views of the mountains.',
        address: 'The Ridge, Shimla, Himachal Pradesh 171001',
        latitude: 31.1065, longitude: 77.1727, opening_hours: 'Open 24 hours',
        avg_visit_duration_mins: 90, entry_fee: null
    },
    {
        destination_name: 'Shimla', destination_country: 'India',
        name: 'Jakhoo Temple', category: 'Landmark',
        description: 'An ancient temple dedicated to Lord Hanuman, located on Jakhoo Hill, the highest peak in Shimla.',
        address: 'Jakhoo Temple Park, Jakhoo, Shimla, Himachal Pradesh 171001',
        latitude: 31.1030, longitude: 77.1783, opening_hours: '5:00 AM - 12:00 PM, 4:00 PM - 9:00 PM',
        avg_visit_duration_mins: 120, entry_fee: null
    }
];

// Define relationships between POIs and Tags
const poi_tags_relations = [
    { poi_name: 'Amber Fort', tag_name: 'History' },
    { poi_name: 'Amber Fort', tag_name: 'Art & Culture' },
    { poi_name: 'Hawa Mahal', tag_name: 'History' },
    { poi_name: 'Laxmi Misthan Bhandar (LMB)', tag_name: 'Foodie'},
    { poi_name: 'Baga Beach', tag_name: 'Beach' },
    { poi_name: 'Baga Beach', tag_name: 'Nightlife' },
    { poi_name: 'Baga Beach', tag_name: 'Adventure'}, // Assuming water sports
    { poi_name: 'Basilica of Bom Jesus', tag_name: 'History' },
    { poi_name: 'Basilica of Bom Jesus', tag_name: 'Art & Culture'},
    { poi_name: 'The Ridge', tag_name: 'Nature' },
    { poi_name: 'The Ridge', tag_name: 'Family Friendly' },
    { poi_name: 'Jakhoo Temple', tag_name: 'Nature'},
    { poi_name: 'Jakhoo Temple', tag_name: 'Mountains'},
];

module.exports = {
    tags,
    destinations,
    points_of_interest,
    poi_tags_relations
};
