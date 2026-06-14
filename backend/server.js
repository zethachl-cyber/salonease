const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("./db");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "SalonEase backend is running" });
});

// Register customer
app.post("/api/register", async (req, res) => {
  try {
    const { full_name, email, password, phone_number } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        message: "Full name, email, and password are required"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (full_name, email, password, phone_number, role) VALUES (?, ?, ?, ?, ?)",
      [full_name, email, hashedPassword, phone_number, "customer"]
    );

    res.json({ message: "Registration successful" });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message
    });
  }
});

// Login user
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    res.json({
      message: "Login successful",
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message
    });
  }
});

// Get all services
app.get("/api/services", async (req, res) => {
  try {
    const [services] = await db.query("SELECT * FROM services");
    res.json(services);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch services",
      error: error.message
    });
  }
});

// Get service detail
app.get("/api/services/:id", async (req, res) => {
  try {
    const [services] = await db.query(
      "SELECT * FROM services WHERE service_id = ?",
      [req.params.id]
    );

    if (services.length === 0) {
      return res.status(404).json({
        message: "Service not found"
      });
    }

    res.json(services[0]);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch service detail",
      error: error.message
    });
  }
});

// Get all stylists
app.get("/api/stylists", async (req, res) => {
  try {
    const [stylists] = await db.query("SELECT * FROM stylists");
    res.json(stylists);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch stylists",
      error: error.message
    });
  }
});

// Create booking
app.post("/api/bookings", async (req, res) => {
  try {
    const {
      user_id,
      service_id,
      stylist_id,
      booking_date,
      booking_time
    } = req.body;

    if (!user_id || !service_id || !stylist_id || !booking_date || !booking_time) {
      return res.status(400).json({
        message: "All booking fields are required"
      });
    }

    await db.query(
      "INSERT INTO bookings (user_id, service_id, stylist_id, booking_date, booking_time, status) VALUES (?, ?, ?, ?, ?, ?)",
      [user_id, service_id, stylist_id, booking_date, booking_time, "pending"]
    );

    res.json({ message: "Booking created successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Booking failed",
      error: error.message
    });
  }
});

// Get booking history by user
app.get("/api/bookings/user/:user_id", async (req, res) => {
  try {
    const [bookings] = await db.query(
      `SELECT bookings.*, services.service_name, stylists.stylist_name
       FROM bookings
       JOIN services ON bookings.service_id = services.service_id
       JOIN stylists ON bookings.stylist_id = stylists.stylist_id
       WHERE bookings.user_id = ?
       ORDER BY bookings.booking_date DESC`,
      [req.params.user_id]
    );

    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch booking history",
      error: error.message
    });
  }
});

// Admin get all bookings
app.get("/api/admin/bookings", async (req, res) => {
  try {
    const [bookings] = await db.query(
      `SELECT bookings.*, users.full_name, services.service_name, stylists.stylist_name
       FROM bookings
       JOIN users ON bookings.user_id = users.user_id
       JOIN services ON bookings.service_id = services.service_id
       JOIN stylists ON bookings.stylist_id = stylists.stylist_id
       ORDER BY bookings.booking_date DESC`
    );

    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch admin bookings",
      error: error.message
    });
  }
});

// Admin update booking status
app.put("/api/admin/bookings/:id", async (req, res) => {
  try {
    const { status } = req.body;

    await db.query(
      "UPDATE bookings SET status = ? WHERE booking_id = ?",
      [status, req.params.id]
    );

    res.json({ message: "Booking status updated" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update booking status",
      error: error.message
    });
  }
});
// SETUP DATABASE
app.get("/api/setup-database", async (req, res) => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20),
        role ENUM('customer', 'admin') DEFAULT 'customer'
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS services (
        service_id INT AUTO_INCREMENT PRIMARY KEY,
        service_name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        duration INT NOT NULL
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS stylists (
        stylist_id INT AUTO_INCREMENT PRIMARY KEY,
        stylist_name VARCHAR(100) NOT NULL,
        specialization VARCHAR(100),
        rating DECIMAL(2,1) DEFAULT 5.0
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS bookings (
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
      )
    `);

    const [services] = await db.query("SELECT COUNT(*) AS total FROM services");

    if (services[0].total === 0) {
      await db.query(`
        INSERT INTO services (service_name, description, price, duration) VALUES
        ('Haircut', 'Professional haircut service by experienced stylist.', 50000, 45),
        ('Hair Coloring', 'Hair coloring service with professional hair products.', 150000, 90),
        ('Hair Treatment', 'Hair treatment service to maintain healthy hair.', 100000, 60),
        ('Facial', 'Facial treatment for clean and fresh skin.', 100000, 60),
        ('Manicure', 'Nail care service for clean and beautiful nails.', 60000, 45),
        ('Spa and Massage', 'Relaxing spa and massage service.', 120000, 60)
      `);
    }

    const [stylists] = await db.query("SELECT COUNT(*) AS total FROM stylists");

    if (stylists[0].total === 0) {
      await db.query(`
        INSERT INTO stylists (stylist_name, specialization, rating) VALUES
        ('Jessica', 'Haircut and Styling', 4.8),
        ('Amanda', 'Hair Coloring', 4.7),
        ('Sophie', 'Hair Treatment and Spa', 4.6)
      `);
    }

    res.json({
      message: "Database setup completed successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Database setup failed",
      error: error.message
    });
  }
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
