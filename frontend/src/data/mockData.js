export const currentUser = {
  name: "Abdelmounim O.",
  initials: "AO",
  role: "Etudiant conducteur",
  rating: 4.2,
  tripsCount: 12,
  reservationsCount: 7,
  reviewCount: 33,
  car: "Toyota Yaris - Gris - 4045 AB",
};

export const previewStats = [
  { value: "08", label: "ecrans relies ensemble" },
  { value: "100%", label: "web mobile responsive" },
  { value: "Ready", label: "pret a connecter au backend" },
];

export const tripOptions = [
  {
    id: "trip-1",
    depart: "Marrakech",
    destination: "UPM",
    time: "17:00 - 19:00",
    driver: "Abdelmounim O.",
    driverInitials: "AO",
    car: "Toyota Yaris - Gris - 4045 AB",
    seats: 3,
    duration: "2h",
    price: 30,
    rating: 4.2,
    role: "Etudiant conducteur",
    pickup: "Depart devant la bibliotheque",
  },
  {
    id: "trip-2",
    depart: "Gueliz",
    destination: "UPM",
    time: "07:15 - 07:40",
    driver: "Safaa M.",
    driverInitials: "SM",
    car: "Kia Picanto - Blanc",
    seats: 2,
    duration: "25 min",
    price: 16,
    rating: 4.7,
    role: "Etudiante conductrice",
    pickup: "Cafe de la gare",
  },
  {
    id: "trip-3",
    depart: "Semlalia",
    destination: "UPM",
    time: "08:00 - 08:30",
    driver: "Youssef T.",
    driverInitials: "YT",
    car: "Dacia Logan - Bleu",
    seats: 1,
    duration: "30 min",
    price: 14,
    rating: 4.0,
    role: "Etudiant conducteur",
    pickup: "Arret principal",
  },
];

export const searchFilters = {
  depart: "Lieu de depart",
  destination: "Lieu d'arrivee",
  date: "Demain",
  time: "07:00",
  chips: ["Campus", "Centre ville", "Budget malin"],
};

export const publishDraft = {
  depart: "Lieu de depart",
  destination: "Lieu d'arrivee",
  date: "18 Avril 2026",
  time: "12:30",
  note: "Depart a l'heure, point de rendez-vous confirme apres reservation.",
  seats: 4,
  price: 20,
  message: "Message pour Abdelmounim (compose)",
};

export const profileLinks = [
  { id: "trips", label: "Mes trajets", icon: "ticket", route: "my-trips" },
  {
    id: "reservations",
    label: "Mes reservations",
    icon: "bookmark",
    route: "my-reservations",
  },
  { id: "reviews", label: "Avis recus", icon: "star", route: "profile" },
  { id: "messages", label: "Messages", icon: "chat", route: "my-reservations" },
];

export const publishedTrips = [
  {
    id: "pub-1",
    route: "UPM - Gueliz",
    date: "Aujourd'hui",
    time: "18:30",
    price: 16,
    seats: "2/4",
    status: "Actif",
    passengers: "2 passagers confirmes",
  },
  {
    id: "pub-2",
    route: "Marrakech - UPM",
    date: "Demain",
    time: "07:10",
    price: 30,
    seats: "3/3",
    status: "Complet",
    passengers: "Liste complete",
  },
  {
    id: "pub-3",
    route: "UPM - Semlalia",
    date: "Samedi",
    time: "17:45",
    price: 14,
    seats: "1/4",
    status: "Nouveau",
    passengers: "Encore 3 places",
  },
];

export const reservations = [
  {
    id: "res-1",
    route: "Marrakech - UPM",
    date: "Demain",
    time: "07:00",
    driver: "Safaa M.",
    pickup: "Cafe de la gare",
    status: "Confirmee",
    price: 30,
  },
  {
    id: "res-2",
    route: "UPM - Daoudiat",
    date: "Vendredi",
    time: "18:20",
    driver: "Yassine T.",
    pickup: "Porte principale",
    status: "En attente",
    price: 12,
  },
  {
    id: "res-3",
    route: "Gueliz - UPM",
    date: "Lundi",
    time: "08:10",
    driver: "Salma R.",
    pickup: "Place 16 Novembre",
    status: "Terminee",
    price: 15,
  },
];
