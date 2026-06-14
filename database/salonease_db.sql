CREATE DATABASE IF NOT EXISTS salonease_db;
USE salonease_db;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  role ENUM('customer', 'admin') DEFAULT 'customer'
);

CREATE TABLE services (
  service_id INT AUTO_INCREMENT PRIMARY KEY,
  service_name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration INT NOT NULL
);

CREATE TABLE stylists (
  stylist_id INT AUTO_INCREMENT PRIMARY KEY,
  stylist_name VARCHAR(100) NOT NULL,
  specialization VARCHAR(100),
  rating DECIMAL(2,1) DEFAULT 5.0
);

CREATE TABLE bookings (
  booking_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  service_id INT NOT NULL,
  stylist_id INT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status ENUM('pending', 'approved', 'cancelled', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (service_id) REFERENCES services(service_id),
  FOREIGN KEY (stylist_id) REFERENCES stylists(stylist_id)
);

INSERT INTO services (service_name, description, price, duration) VALUES
('Haircut', 'Professional haircut service by experienced stylist.', 50000, 45),
('Hair Coloring', 'Hair coloring service with professional hair products.', 150000, 90),
('Hair Treatment', 'Hair treatment service to maintain healthy hair.', 100000, 60),
('Facial', 'Facial treatment for clean and fresh skin.', 100000, 60),
('Manicure', 'Nail care service for clean and beautiful nails.', 60000, 45),
('Spa and Massage', 'Relaxing spa and massage service.', 120000, 60);

INSERT INTO stylists (stylist_name, specialization, rating) VALUES
('Jessica', 'Haircut and Styling', 4.8),
('Amanda', 'Hair Coloring', 4.7),
('Sophie', 'Hair Treatment and Spa', 4.6);