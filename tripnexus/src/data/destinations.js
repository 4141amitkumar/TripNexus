const destinations = [
  {
    id: "manali001",
    name: "Manali",
    type: "Mountain Adventures",
    months: ["May", "June", "July", "August", "September"],
    estimatedCost: 10000,
    image: "/images/manali.jpg",
    description: "Scenic hill station in Himachal, perfect for mountain adventures and snowfall lovers.",
    hotels: ["The Himalayan", "Snow Valley Resorts", "Apple Country Resort"],
    nearby: ["Solang Valley", "Rohtang Pass", "Old Manali"]
  },
  {
    id: "goa001",
    name: "Goa",
    type: "Beach Paradise",
    months: ["November", "December", "January", "February"],
    estimatedCost: 15000,
    image: "/images/goa.jpg",
    description: "India’s party capital with golden beaches, nightlife, and Portuguese architecture.",
    hotels: ["Taj Exotica", "Zostel Goa", "The Leela"],
    nearby: ["Baga Beach", "Fort Aguada", "Anjuna Market"]
  },
  {
    id: "jimcorbett001",
    name: "Jim Corbett",
    type: "Wildlife Safari",
    months: ["October", "November", "February", "March", "April"],
    estimatedCost: 9000,
    image: "/images/corbett.jpg",
    description: "India’s oldest national park known for Bengal tigers and jeep safaris.",
    hotels: ["The Riverview Retreat", "Corbett Machaan", "Aahana Resort"],
    nearby: ["Garjia Temple", "Sitabani Temple", "Corbett Museum"]
  },
  {
    id: "udaipur001",
    name: "Udaipur",
    type: "Romantic Getaway",
    months: ["October", "November", "December", "January", "February"],
    estimatedCost: 12000,
    image: "/images/udaipur.jpg",
    description: "City of Lakes, perfect for romantic stays and sunset boat rides.",
    hotels: ["Taj Lake Palace", "Hotel Trident", "The Oberoi Udaivilas"],
    nearby: ["City Palace", "Lake Pichola", "Saheliyon Ki Bari"]
  },
  {
    id: "rishikesh001",
    name: "Rishikesh",
    type: "Extreme Adventures",
    months: ["March", "April", "September", "October"],
    estimatedCost: 7000,
    image: "/images/rishikesh.jpg",
    description: "Adventure hub for bungee jumping, river rafting, and yoga retreats.",
    hotels: ["Aloha on the Ganges", "Ganga Kinare", "Live Free Hostel"],
    nearby: ["Ram Jhula", "Neelkanth Mahadev", "Shivpuri"]
  },
  {
    id: "varanasi001",
    name: "Varanasi",
    type: "Spiritual Journey",
    months: ["October", "November", "December", "January", "February"],
    estimatedCost: 8000,
    image: "/images/varanasi.jpg",
    description: "Spiritual capital of India known for Ganga Aarti and Kashi Vishwanath Temple.",
    hotels: ["BrijRama Palace", "Ganges View", "Hotel Alka"],
    nearby: ["Dashashwamedh Ghat", "Sarnath", "Manikarnika Ghat"]
  },
  {
    id: "hampi001",
    name: "Hampi",
    type: "Heritage Exploration",
    months: ["November", "December", "January", "February"],
    estimatedCost: 8500,
    image: "/images/hampi.jpg",
    description: "UNESCO heritage site with ancient temples and rich Vijayanagara history.",
    hotels: ["Heritage Resort", "Hyatt Place Hampi", "Shanthi Guesthouse"],
    nearby: ["Virupaksha Temple", "Vittala Temple", "Elephant Stables"]
  },
  {
    id: "andaman001",
    name: "Andaman Islands",
    type: "Luxury / Resort",
    months: ["October", "November", "December", "January", "February", "March"],
    estimatedCost: 20000,
    image: "/images/andaman.jpg",
    description: "Tropical luxury getaway with coral reefs, clear waters, and beach resorts.",
    hotels: ["Taj Exotica", "Barefoot at Havelock", "SeaShell Resort"],
    nearby: ["Radhanagar Beach", "Cellular Jail", "Ross Island"]
  },
  {
    id: "pushkar001",
    name: "Pushkar",
    type: "Cultural / Festival",
    months: ["October", "November"],
    estimatedCost: 6500,
    image: "/images/pushkar.jpg",
    description: "Town famous for Pushkar Camel Fair and vibrant Rajasthani culture.",
    hotels: ["Ananta Spa", "Pushkar Palace", "Inn Seventh Heaven"],
    nearby: ["Pushkar Lake", "Brahma Temple", "Camel Safari Grounds"]
  },
  {
    id: "munnar001",
    name: "Munnar",
    type: "Nature Retreat",
    months: ["June", "July", "August", "September"],
    estimatedCost: 9500,
    image: "/images/munnar.jpg",
    description: "Hill station in Kerala with tea plantations and cool climate.",
    hotels: ["Tea County", "Parakkat Resort", "The Fog Resort"],
    nearby: ["Mattupetty Dam", "Eravikulam National Park", "Tea Museum"]
  },
];

export default destinations;
