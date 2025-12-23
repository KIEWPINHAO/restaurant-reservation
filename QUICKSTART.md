# Quick Start Guide

Get the Restaurant Booking System running in 5 minutes!

## Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **MySQL 8.0+** - [Download](https://dev.mysql.com/downloads/)
- **AWS Account** (for cloud deployment) - [Sign up](https://aws.amazon.com/)

## Local Development Setup

### Option 1: Automated Setup (Recommended)

```bash
# Run the setup script
./setup.sh
```

The script will:
- Install dependencies for frontend and backend
- Create .env files
- Initialize the database schema
- Create default users

### Option 2: Manual Setup

#### Step 1: Setup Backend

```bash
cd backend
npm install
```

#### Step 2: Configure Database

Create a MySQL database:
```sql
CREATE DATABASE restaurant_booking;
```

Create `.env` file in `backend/` directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=restaurant_booking
DB_PORT=3306

AWS_ACCESS_KEY_ID=your_key_here
AWS_SECRET_ACCESS_KEY=your_secret_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=restaurant-booking-dev

JWT_SECRET=your-random-secret-key-min-32-characters
JWT_EXPIRES_IN=24h

PORT=3001
NODE_ENV=development

FRONTEND_URL=http://localhost:5173
```

#### Step 3: Initialize Database

```bash
cd backend
npm run init-db
```

You should see:
```
✅ Database schema initialized successfully
✅ Default users created
   Admin: admin@test.com / admin123
   Customer: customer@test.com / customer123
```

#### Step 4: Setup Frontend

```bash
cd ..  # Back to project root
npm install
```

Create `.env` file in project root:
```env
VITE_API_URL=http://localhost:3001/api
```

## Running the Application

### Start Backend (Terminal 1)

```bash
cd backend
npm run dev
```

You should see:
```
✅ Database connection successful
✅ Server running on port 3001
```

### Start Frontend (Terminal 2)

```bash
npm run dev
```

Visit: http://localhost:5173

## First Login

Use these credentials to test:

**Admin Account:**
- Email: `admin@test.com`
- Password: `admin123`

**Customer Account:**  
- Email: `customer@test.com`
- Password: `customer123`

## Testing Features

### As Customer:
1. **Book a Table**
   - Select date (only future dates)
   - Choose time slot (9am - 9pm)
   - Select number of guests
   - Click "Book Table"

2. **View Reservations**
   - See upcoming bookings
   - Cancel bookings
   - View past bookings

3. **Browse Menu**
   - View restaurant menu items
   - See prices and descriptions

4. **Update Profile**
   - Change name and phone
   - Upload profile picture (requires S3 setup)

### As Admin:
1. **Dashboard**
   - View all bookings in table
   - Search and filter bookings
   - Sort by date/time/name/guests
   - Update booking status

2. **Menu Management**
   - Upload new menu items (requires S3 setup)
   - View all menu items

## AWS S3 Setup (Required for Image Uploads)

Without S3 configuration, you can use all features except image uploads.

### Quick S3 Setup:

1. **Create S3 Bucket**
   - Login to AWS Console
   - Go to S3 → Create bucket
   - Name: `restaurant-booking-dev`
   - Region: `us-east-1`
   - Uncheck "Block all public access"
   - Create bucket

2. **Add Bucket Policy**
   - Go to bucket → Permissions → Bucket policy
   - Add this policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Sid": "PublicReadGetObject",
       "Effect": "Allow",
       "Principal": "*",
       "Action": "s3:GetObject",
       "Resource": "arn:aws:s3:::restaurant-booking-dev/*"
     }]
   }
   ```

3. **Create IAM User**
   - Go to IAM → Users → Add user
   - Name: `restaurant-s3-user`
   - Access type: Programmatic access
   - Permissions: `AmazonS3FullAccess`
   - Download credentials (CSV file)

4. **Update Backend .env**
   ```env
   AWS_ACCESS_KEY_ID=your_access_key_from_csv
   AWS_SECRET_ACCESS_KEY=your_secret_key_from_csv
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=restaurant-booking-dev
   ```

5. **Restart Backend**
   ```bash
   cd backend
   npm run dev
   ```

Now image uploads will work!

## Troubleshooting

### Backend won't start

**Error: "Database connection failed"**
```bash
# Check if MySQL is running
mysql -u root -p
# If it works, check credentials in backend/.env
```

**Error: "Table doesn't exist"**
```bash
cd backend
npm run init-db
```

### Frontend can't connect to backend

**Error: "Network error" or "Failed to fetch"**
- Check backend is running on port 3001
- Check `.env` has `VITE_API_URL=http://localhost:3001/api`
- Restart frontend: `npm run dev`

### Image uploads fail

**Error: "Cloud storage upload failed"**
- Check AWS credentials in backend/.env
- Verify S3 bucket exists
- Check bucket policy allows public read
- Restart backend after .env changes

### Port already in use

**Backend port 3001 in use:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Frontend port 5173 in use:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

## API Testing with curl

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@test.com","password":"customer123"}'
```

### Get Bookings (replace TOKEN)
```bash
curl http://localhost:3001/api/bookings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Booking (replace TOKEN)
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

## Next Steps

- **Deploy to Cloud**: See `DEPLOYMENT.md`
- **Backend Docs**: See `backend/README.md`
- **Project Overview**: See `PROJECT_SUMMARY.md`

## Need Help?

1. Check the logs:
   ```bash
   # Backend logs show in terminal where you ran npm run dev
   
   # Or if using PM2 in production:
   pm2 logs restaurant-api
   ```

2. Test database connection:
   ```bash
   mysql -h localhost -u root -p
   USE restaurant_booking;
   SHOW TABLES;
   ```

3. Check backend health:
   ```bash
   curl http://localhost:3001/health
   ```

## Success!

You should now have:
- ✅ Backend running on http://localhost:3001
- ✅ Frontend running on http://localhost:5173
- ✅ MySQL database with sample data
- ✅ Admin and customer accounts ready

Happy booking! 🎉
