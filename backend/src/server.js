import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import configurations
import { testConnection, closePool } from './config/database.js';
import { testS3Connection } from './config/cloudStorage.js';

// Import routes
import authRoutes from './routes/auth.js';
import bookingRoutes from './routes/bookings.js';
import menuRoutes from './routes/menu.js';
import userRoutes from './routes/user.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration: allow frontend ALB and EC2 IP (explicit list) and handle preflight
const allowedOrigins = [process.env.FRONTEND_URL, 'http://restaurant-alb-701349099.us-east-1.elb.amazonaws.com', 'http://98.92.153.155'].filter(Boolean);
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
// Ensure preflight OPTIONS requests are handled for all routes
app.options('*', cors(corsOptions));

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const origin = req.headers.origin || req.headers.Origin || 'no-origin';
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${origin}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/user', userRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    statusCode: 404
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server gracefully...');
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing server gracefully...');
  await closePool();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    console.log('🚀 Starting Restaurant Booking System Backend...');
    console.log(`   Environment: ${process.env.NODE_ENV}`);
    console.log(`   Port: ${PORT}`);
    
    // Test database connection
    console.log('\n📊 Testing Database Connection...');
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('⚠️  Warning: Database connection failed. Some features may not work.');
    }

    // Test S3 connection
    console.log('\n☁️  Testing S3 Connection...');
    const s3Connected = await testS3Connection();
    if (!s3Connected) {
      console.error('⚠️  Warning: S3 connection failed. Image uploads will not work.');
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n✅ Server running on port ${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/health`);
      console.log(`   API base URL: http://localhost:${PORT}/api`);
      console.log('\n📋 Available Endpoints:');
      console.log('   POST   /api/auth/login');
      console.log('   POST   /api/auth/register');
      console.log('   GET    /api/auth/profile');
      console.log('   GET    /api/bookings');
      console.log('   POST   /api/bookings');
      console.log('   GET    /api/bookings/slots/:date');
      console.log('   PATCH  /api/bookings/:id/status');
      console.log('   GET    /api/menu');
      console.log('   POST   /api/menu (admin)');
      console.log('   PUT    /api/user/profile');
      console.log('\n🔐 Default Credentials:');
      console.log('   Admin: admin@test.com / admin123');
      console.log('   Customer: customer@test.com / customer123');
      console.log('\n⚠️  Remember to run: npm run init-db (first time setup)\n');
    });

  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
