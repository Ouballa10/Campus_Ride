-- CampusRide schema
CREATE DATABASE IF NOT EXISTS campusride;
USE campusride;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL,
  role ENUM('conducteur', 'passager', 'admin') DEFAULT 'passager',
  photo_profil VARCHAR(255),
  note_moyenne DECIMAL(3,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS trajets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  depart VARCHAR(150) NOT NULL,
  destination VARCHAR(150) NOT NULL,
  date DATE NOT NULL,
  heure TIME NOT NULL,
  places_disponibles INT NOT NULL,
  prix_par_place DECIMAL(10,2) NOT NULL,
  description TEXT,
  conducteur_id INT,
  FOREIGN KEY (conducteur_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trajet_id INT NOT NULL,
  passager_id INT NOT NULL,
  date_reservation DATETIME DEFAULT CURRENT_TIMESTAMP,
  statut ENUM('confirmee', 'annulee', 'en_attente') DEFAULT 'en_attente',
  FOREIGN KEY (trajet_id) REFERENCES trajets(id) ON DELETE CASCADE,
  FOREIGN KEY (passager_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS evaluations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  conducteur_id INT NOT NULL,
  note DECIMAL(2,1) NOT NULL,
  commentaire TEXT,
  FOREIGN KEY (utilisateur_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (conducteur_id) REFERENCES users(id) ON DELETE CASCADE
);
