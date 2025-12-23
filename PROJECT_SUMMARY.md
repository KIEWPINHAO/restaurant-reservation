# Restaurant Booking System - Cloud Computing Project

## ✅ Implementation Complete

This is a **full-stack cloud-based** restaurant booking system built for a Cloud Computing course project.

## Architecture

### Real Cloud Infrastructure (NOT Mock!)

```
Frontend (React)
    ↓ HTTP/HTTPS
Backend API (Express.js on EC2)
    ↓
├─→ RDS MySQL Database (Persistent data)
├─→ AWS S3 (Image storage)
└─→ CloudWatch (Monitoring - optional)
```

## Key Features

### ✅ **Real Backend API** (Not Mock)
- **Express.js server** with proper REST API endpoints
- **JWT authentication** with hashed passwords (bcrypt)
- **MySQL connection pooling** for scalability
- **Error handling** for cloud service failures
- **Rate limiting** and security headers (Helmet)

### ✅ **Cloud Database Integration** (RDS MySQL)
- Proper database schema with foreign keys
- Connection pooling for auto-scaling support
- Persistent storage across instances
- Transaction support

### ✅ **Cloud Storage Integration** (AWS S3)
- **Real S3 uploads** using AWS SDK
- Profile pictures stored in S3
- Menu images stored in S3
- Public URL generation
- Retry logic for network failures

### ✅ **Security Implementation**
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with expiration
- CORS configuration
- Rate limiting (100 req/15min)
- SQL injection prevention (prepared statements)
- Environment-based configuration

### ✅ **Scalability Ready**
- Stateless backend (scales horizontally)
- Connection pooling
- Load balancer compatible
- PM2 process management
- Auto-scaling group ready

## File Structure

```
restaurant-booking-system/
├── backend/                    # Node.js Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js    # RDS MySQL connection pool
│   │   │   ├── cloudStorage.js # AWS S3 integration
│   │   │   └── initDatabase.js # Schema initialization
│   │   ├── controllers/
│   │   │   ├── authController.js    # Login/Register
│   │   │   ├── bookingController.js # Bookings CRUD
│   │   │   ├── menuController.js    # Menu with S3 uploads
│   │   │   └── userController.js    # Profile management
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT verification
│   │   │   └── errorHandler.js # Cloud error handling
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── bookings.js
│   │   │   ├── menu.js
│   │   │   └── user.js
│   │   └── server.js          # Express app entry point
│   ├── .env                   # Production config (not in git)
│   ├── .env.example           # Template
│   ├── package.json
│   └── README.md              # Backend docs
│
├── src/                       # React Frontend
│   ├── components/
│   │   ├── BookingCalendar.tsx
│   │   ├── MenuDisplay.tsx
│   │   └── ui/                # shadcn/ui components
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── CustomerBooking.tsx
│   │   ├── MyReservations.tsx
│   │   ├── Menu.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── MenuUpload.tsx
│   │   └── Settings.tsx
│   ├── lib/
│   │   ├── api.ts             # Real API calls (replaced mock)
│   │   └── auth.ts            # Auth hook
│   ├── types.ts               # TypeScript interfaces
│   └── App.tsx                # Main app component
│
├── DEPLOYMENT.md              # Step-by-step cloud deployment
└── PROJECT_SUMMARY.md         # This file
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,  -- bcrypt hashed
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role ENUM('customer', 'admin'),
  profile_picture_url VARCHAR(500),     -- S3 URL
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  booking_date DATE NOT NULL,
  time_slot TIME NOT NULL,
  guest_count INT NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed'),
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_booking (booking_date, time_slot, status)
);
```

### Menu Items Table
```sql
CREATE TABLE menu_items (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500) NOT NULL,      -- S3 URL
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register with hashed password
- `POST /api/auth/login` - Login with JWT token
- `GET /api/auth/profile` - Get current user (requires auth)

### Bookings
- `GET /api/bookings` - Get bookings (filtered by role)
- `POST /api/bookings` - Create booking (checks conflicts)
- `GET /api/bookings/slots/:date` - Get booked time slots
- `PATCH /api/bookings/:id/status` - Update status
- `DELETE /api/bookings/:id` - Delete (admin only)

### Menu
- `GET /api/menu` - Get all menu items (public)
- `POST /api/menu` - Upload item to S3 + DB (admin)
- `PUT /api/menu/:id` - Update item (admin)
- `DELETE /api/menu/:id` - Delete item (admin)

### User Profile
- `PUT /api/user/profile` - Update profile with S3 picture upload

## Deployment Instructions

### Quick Start (Local Development)

**Backend:**
```bash
cd backend
npm install

# Setup local MySQL
mysql -u root -p
CREATE DATABASE restaurant_booking;

# Configure .env
cp .env.example .env
# Edit .env with your MySQL credentials

# Initialize database
npm run init-db

# Start server
npm run dev
```

**Frontend:**
```bash
cd ..
npm install
npm run dev
```

### Cloud Deployment (AWS)

See **DEPLOYMENT.md** for comprehensive guide covering:
1. RDS MySQL setup
2. S3 bucket configuration
3. EC2 instance deployment
4. Security group configuration
5. Auto-scaling setup
6. Load balancer configuration
7. CloudWatch monitoring

**Key Points:**
- Backend runs on EC2 with PM2 process manager
- Database on RDS MySQL (persistent, scalable)
- Images on S3 (CDN-ready)
- Nginx reverse proxy for production
- SSL/TLS with Let's Encrypt (optional)

## Default Credentials

**Admin Account:**
- Email: admin@test.com
- Password: admin123

**Customer Account:**
- Email: customer@test.com
- Password: customer123

**⚠️ Change these in production!**

## Cloud Requirements Checklist

- [x] **Real Backend** (not mock) - Express.js with proper API
- [x] **Cloud Database** (not localStorage) - RDS MySQL with connection pool
- [x] **Cloud Storage** (not Data URLs) - AWS S3 with SDK integration
- [x] **Persistent Auth** - JWT with database-stored user credentials
- [x] **Hashed Passwords** - bcrypt with 10 rounds
- [x] **Image Storage** - S3 URLs stored in database
- [x] **Error Handling** - Application-level error handling for cloud failures
- [x] **Scalability** - Stateless design, connection pooling, auto-scaling ready
- [x] **Security** - Helmet, CORS, rate limiting, prepared statements
- [x] **Deployment Ready** - PM2, Nginx configs, .env templates

## Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MySQL 8.0+ (RDS)
- **Storage:** AWS S3
- **Auth:** JWT + bcrypt
- **ORM:** Native MySQL2 with prepared statements
- **Process Manager:** PM2
- **Security:** Helmet, CORS, express-rate-limit

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui
- **Calendar:** react-day-picker
- **Date Utils:** date-fns
- **Notifications:** Sonner
- **HTTP Client:** Fetch API

### Infrastructure
- **Compute:** AWS EC2 (t2.micro or higher)
- **Database:** AWS RDS MySQL
- **Storage:** AWS S3
- **Monitoring:** CloudWatch (optional)
- **Load Balancer:** Application Load Balancer (optional)
- **Auto Scaling:** EC2 Auto Scaling Groups (optional)

## Testing

### Health Check
```bash
curl http://localhost:3001/health
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@test.com","password":"customer123"}'
```

### Create Booking
```bash
curl -X POST http://localhost:3001/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "date":"2025-12-25",
    "timeSlot":"19:00",
    "guestCount":4
  }'
```

## Cost Estimate (AWS)

**Free Tier (12 months):**
- EC2 t2.micro: 750 hours/month
- RDS db.t3.micro: 750 hours/month  
- S3: 5GB + 20,000 GET requests
- Total: $0/month

**After Free Tier:**
- EC2 t2.micro: ~$8/month
- RDS db.t3.micro: ~$15/month
- S3: ~$1/month (for typical usage)
- Data transfer: ~$5/month
- **Total: ~$30/month**

## Troubleshooting

### Backend won't start
- Check RDS endpoint is correct
- Verify AWS credentials
- Run `npm run init-db` to create tables

### Images not uploading
- Verify S3 bucket exists
- Check IAM credentials have S3 access
- Ensure bucket policy allows public read

### CORS errors
- Update `FRONTEND_URL` in backend/.env
- Restart backend: `pm2 restart restaurant-api`

## Project Comparison

| Component | Original Mock | Cloud Implementation | Status |
|-----------|--------------|---------------------|--------|
| Data Storage | localStorage | RDS MySQL | ✅ Fixed |
| Images | Data URLs | S3 + URLs | ✅ Fixed |
| Authentication | Mock tokens | JWT + bcrypt | ✅ Fixed |
| Hosting | Frontend only | EC2 Backend + RDS + S3 | ✅ Fixed |
| Scalability | Single browser | Auto-scaling ready | ✅ Fixed |
| Persistence | Session only | Database persistent | ✅ Fixed |

## Team Integration

This project is designed to work with:

**Role 1 - Infrastructure Engineer:**
- Provisions EC2, RDS, S3
- Configures security groups
- Sets up auto-scaling
- Provides connection endpoints

**Role 2 - Application Developer (This Project):**
- Backend API development
- Database schema design
- S3 integration
- Frontend integration
- Error handling

**Role 3 - Security Lead:**
- Reviews S3 bucket policies
- Audits authentication implementation
- Configures security groups
- SSL/TLS certificates
- Monitors CloudWatch logs

## License

MIT License - Educational project for Cloud Computing course

## Support

For issues:
1. Check logs: `pm2 logs restaurant-api`
2. Verify environment variables
3. Test database connection
4. Check CloudWatch logs (if configured)
5. Open GitHub issue with error details
