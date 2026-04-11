-- Sample seed data
USE campusride;

INSERT INTO users (nom, prenom, email, mot_de_passe, role)
VALUES
('Ouballa', 'Abdelmounaim', 'abdel@example.com', '123456', 'conducteur'),
('Mouncir', 'Rania', 'rania@example.com', '123456', 'passager');
