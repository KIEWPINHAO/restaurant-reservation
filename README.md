# Restaurant Booking System - Cloud Computing Project

A full-stack cloud-based restaurant booking system with **real backend API**, **RDS MySQL database**, and **AWS S3 storage**.

## 🌟 Key Features

- ✅ **Real Express.js Backend** (not mock!) running on EC2
- ✅ **RDS MySQL Database** (persistent, scalable)
- ✅ **AWS S3 Storage** (menu images, profile pictures)
- ✅ **JWT Authentication** with bcrypt password hashing
- ✅ **Customer Portal** - Book tables, view reservations, browse menu
- ✅ **Admin Dashboard** - Manage all bookings, upload menu items
- ✅ **Cloud-Ready** - Auto-scaling support, connection pooling, error handling

## 📋 Quick Links

- **[Quick Start Guide](QUICKSTART.md)** - Get running in 5 minutes
- **[Deployment Guide](DEPLOYMENT.md)** - Deploy to AWS cloud
- **[Backend Documentation](backend/README.md)** - API reference
- **[Project Summary](PROJECT_SUMMARY.md)** - Full technical details

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- AWS Account (for S3 - optional for local testing)

### Automated Setup

```bash
# Run the setup script
./setup.sh
```

### Manual Setup

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Configure database
cp .env.example .env
# Edit .env with your MySQL credentials

# 3. Initialize database
npm run init-db

# 4. Start backend
npm run dev
```

In a new terminal:
```bash
# 5. Install frontend dependencies
cd ..
npm install

# 6. Start frontend
npm run dev
```

Visit: **http://localhost:5173**

### Default Credentials
- **Admin**: admin@test.com / admin123
- **Customer**: customer@test.com / customer123

## 🏗️ Architecture

```
┌─────────────┐
│   React     │  Frontend (Vite + React)
│  Frontend   │
└──────┬──────┘
       │ HTTP/REST
       ▼
┌─────────────┐
│  Express.js │  Backend API (Node.js on EC2)
│   Backend   │
└──┬───┬───┬──┘
   │   │   │
   │   │   └─────────┐
   │   │             ▼
   │   │      ┌─────────────┐
   │   │      │   AWS S3    │  Image Storage
   │   │      │   Bucket    │
   │   │      └─────────────┘
   │   │
   │   └──────────────┐
   │                  ▼
   │           ┌─────────────┐
   │           │  RDS MySQL  │  Database
   │           │  Instance   │
   │           └─────────────┘
   │
   └──────────────────┐
                      ▼
               ┌─────────────┐
               │ CloudWatch  │  Monitoring (optional)
               │    Logs     │
               └─────────────┘
```

## 📦 Tech Stack

### Backend
- **Node.js + Express.js** - REST API server
- **MySQL2** - Database driver with connection pooling
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **aws-sdk** - S3 integration
- **multer** - File upload handling
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **date-fns** - Date utilities
- **sonner** - Toast notifications

### Cloud Infrastructure
- **AWS EC2** - Virtual machine for backend
- **AWS RDS** - Managed MySQL database
- **AWS S3** - Object storage for images
- **PM2** - Process management
- **Nginx** - Reverse proxy (optional)

## 📁 Project Structure

```
restaurant-booking-system/
├── backend/                      # Node.js Backend
│   ├── src/
│   │   ├── config/              # Database, S3 configuration
│   │   ├── controllers/         # Business logic
│   │   ├── middleware/          # Auth, error handling
│   │   ├── routes/              # API endpoints
│   │   └── server.js            # Entry point
│   ├── .env.example
│   └── package.json
│
├── src/                          # React Frontend
│   ├── components/              # UI components
│   ├── pages/                   # Page components
│   ├── lib/                     # API client, utilities
│   ├── types.ts                 # TypeScript types
│   └── App.tsx                  # Main app
│
├── QUICKSTART.md                 # 5-minute setup guide
├── DEPLOYMENT.md                 # AWS deployment guide
├── PROJECT_SUMMARY.md            # Technical documentation
└── setup.sh                      # Automated setup script
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/profile` - Get current user

### Bookings
- `GET /api/bookings` - Get bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/slots/:date` - Get available time slots
- `PATCH /api/bookings/:id/status` - Update booking status
- `DELETE /api/bookings/:id` - Delete booking (admin)

### Menu
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Upload menu item (admin)
- `PUT /api/menu/:id` - Update menu item (admin)
- `DELETE /api/menu/:id` - Delete menu item (admin)

### User Profile
- `PUT /api/user/profile` - Update profile

## 🔒 Security Features

- ✅ **Password Hashing** - bcrypt with 10 rounds
- ✅ **JWT Authentication** - Token-based auth with expiration
- ✅ **SQL Injection Prevention** - Prepared statements
- ✅ **CORS Protection** - Configurable origins
- ✅ **Rate Limiting** - 100 requests per 15 minutes
- ✅ **Security Headers** - Helmet middleware
- ✅ **Environment Variables** - Sensitive data not in code

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3001/health
```

### Login Test
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@test.com","password":"customer123"}'
```

### Create Booking
```bash
curl -X POST http://localhost:3001/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"date":"2025-12-25","timeSlot":"19:00","guestCount":4}'
```

## 🚢 Deployment

### AWS Cloud Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for step-by-step instructions covering:
1. RDS MySQL database setup
2. S3 bucket configuration
3. EC2 instance deployment
4. Security group configuration
5. Auto-scaling setup
6. Load balancer configuration

### Quick Deploy Checklist
- [ ] Create RDS MySQL instance
- [ ] Create S3 bucket with public read policy
- [ ] Create IAM user with S3 access
- [ ] Launch EC2 instance (Ubuntu 22.04)
- [ ] Install Node.js, PM2, Nginx on EC2
- [ ] Clone repo and configure .env
- [ ] Initialize database schema
- [ ] Start backend with PM2
- [ ] Configure Nginx reverse proxy
- [ ] Update frontend .env with API URL
- [ ] Build and deploy frontend

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Test MySQL connection
mysql -h your-rds-endpoint.rds.amazonaws.com -u admin -p

# Check backend logs
cd backend
npm run dev  # Check error messages
```

### S3 Upload Failures
- Verify AWS credentials in backend/.env
- Check S3 bucket exists and has correct name
- Ensure bucket policy allows public read
- Verify IAM user has S3 permissions

### API Connection Errors
- Ensure backend is running: `curl http://localhost:3001/health`
- Check frontend .env has correct API_URL
- Verify CORS settings in backend
- Check security groups allow traffic (cloud deployment)

## 📊 Cloud Requirements Met

| Requirement | Implementation | Status |
|------------|----------------|--------|
| Real Backend | Express.js API on EC2 | ✅ |
| Cloud Database | RDS MySQL with pooling | ✅ |
| Cloud Storage | AWS S3 for images | ✅ |
| Persistent Auth | JWT + hashed passwords in DB | ✅ |
| Scalability | Stateless, auto-scaling ready | ✅ |
| Error Handling | Application-level cloud errors | ✅ |

## 💰 Cost Estimate

**AWS Free Tier (12 months):**
- EC2 t2.micro: Free
- RDS db.t3.micro: Free
- S3: 5GB + 20K requests free
- **Total: $0/month**

**After Free Tier:**
- EC2: ~$8/month
- RDS: ~$15/month
- S3: ~$1/month
- **Total: ~$25-30/month**

## 📝 License

MIT License - Educational project for Cloud Computing course

## 🤝 Team Collaboration

This project integrates with:
- **Infrastructure Engineer** - Provisions AWS resources
- **Application Developer** - This project
- **Security Lead** - Reviews security policies

## 📞 Support

1. Check **[QUICKSTART.md](QUICKSTART.md)** for setup issues
2. Check **[DEPLOYMENT.md](DEPLOYMENT.md)** for cloud deployment
3. Check backend logs: `pm2 logs restaurant-api`
4. Check database: `mysql -h <host> -u admin -p`
5. Test S3: Check bucket permissions in AWS console

---

**Made with ☕ for Cloud Computing Course**
