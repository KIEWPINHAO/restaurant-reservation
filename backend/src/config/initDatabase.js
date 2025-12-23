import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs'; // <--- Standard import fixes the error

// 1. Load Environment Variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const schema = `
-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role ENUM('customer', 'admin') DEFAULT 'customer',
  profile_picture_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  booking_date DATE NOT NULL,
  time_slot TIME NOT NULL,
  guest_count INT NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_booking_date (booking_date),
  INDEX idx_status (status),
  INDEX idx_date_time (booking_date, time_slot),
  UNIQUE KEY unique_booking (booking_date, time_slot, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

async function initializeDatabase() {
  let connection;
  try {
    console.log('🚀 Starting Cloud Database Initialization...');
    console.log(`📡 Connecting to AWS Host: ${process.env.DB_HOST}...`);

    // 2. Connect to AWS RDS
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: 3306,
      ssl: { rejectUnauthorized: false }
    });

    // 3. Create/Check Database
    console.log(`🛠  Checking database '${process.env.DB_NAME}'...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    console.log(`✅ Database '${process.env.DB_NAME}' is ready.`);

    // 4. Switch to Database
    await connection.changeUser({ database: process.env.DB_NAME });

    // 5. Run Schema
    console.log('🔄 Creating Tables (Schema)...');
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await connection.query(statement);
    }
    console.log('✅ Tables created successfully');

    // 6. Seed Data (Admin & Customer)
    // Now using the standard imported bcrypt variable
    const adminId = crypto.randomUUID();
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    
    await connection.query(
      `INSERT IGNORE INTO users (id, email, password_hash, name, role) 
       VALUES (?, 'admin@test.com', ?, 'Admin User', 'admin')`,
      [adminId, adminPasswordHash]
    );

    const customerId = crypto.randomUUID();
    const customerPasswordHash = await bcrypt.hash('customer123', 10);
    
    await connection.query(
      `INSERT IGNORE INTO users (id, email, password_hash, name, role) 
       VALUES (?, 'customer@test.com', ?, 'John Doe', 'customer')`,
      [customerId, customerPasswordHash]
    );

    console.log('👤 Default users verified:');
    console.log('   Admin: admin@test.com / admin123');
    console.log('   Customer: customer@test.com / customer123');

    // 7. Seed Menu Items
    const menuItems = [
      ['menu-1', 'Grilled Salmon', 'Fresh Atlantic salmon with herbs', 28.99, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400'],
      ['menu-2', 'Caesar Salad', 'Classic Caesar with parmesan', 12.99, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400'],
      ['menu-3', 'Ribeye Steak', 'Premium USDA ribeye, 12oz', 42.99, 'https://images.unsplash.com/photo-1558030006-450675393462?w=400'],
      ['menu-4', 'Margherita Pizza', 'Fresh mozzarella and basil', 16.99, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400'],
    ];

    for (const item of menuItems) {
      await connection.query(
        `INSERT IGNORE INTO menu_items (id, name, description, price, image_url) 
         VALUES (?, ?, ?, ?, ?)`,
        item
      );
    }
    console.log('🍕 Sample menu items created');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
    console.log('👋 Connection closed.');
    process.exit(0);
  }
}

initializeDatabase();