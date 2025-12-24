import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();


// Create connection pool for RDS MySQL
// Connection pooling is crucial for scalability and auto-scaling
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10, // Adjust based on RDS instance size
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Connection timeout handling for cloud environments
  connectTimeout: 10000,
  // Handle connection loss and retry
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : undefined
});

// Test database connection with error handling
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Database: ${process.env.DB_NAME}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   → Database server is not running or unreachable');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   → Invalid database credentials');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('   → Connection timeout - check security groups and network config');
    }
    return false;
  }
}

// Graceful shutdown
export async function closePool() {
  try {
    await pool.end();
    console.log('Database pool closed');
  } catch (error) {
    console.error('Error closing database pool:', error);
  }
}

export default pool;
