# Restaurant Booking System - Backend

Cloud-based restaurant booking system with Express.js, MySQL (RDS), and AWS S3.

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   React     │─────▶│  Express.js │─────▶│   RDS MySQL │
│  Frontend   │      │   Backend   │      │  Database   │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │   AWS S3    │
                     │   Storage   │
                     └─────────────┘
```

## Prerequisites

- Node.js 18+ 
- MySQL 8.0+ (Local) or AWS RDS MySQL instance
- AWS Account with S3 bucket created
- AWS IAM credentials with S3 access

## Local Development Setup

### 1. Install Dependencies

\`\`\`bash
cd backend
npm install
\`\`\`

### 2. Configure Environment Variables

Copy \`.env.example\` to \`.env\` and update with your values:

\`\`\`bash
cp .env.example .env
\`\`\`

For local development with MySQL:
\`\`\`env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=restaurant_booking
\`\`\`

### 3. Initialize Database

\`\`\`bash
npm run init-db
\`\`\`

This will:
- Create tables (users, bookings, menu_items)
- Insert default users (admin@test.com, customer@test.com)
- Insert sample menu items

### 4. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Server will run on http://localhost:3001

## Cloud Deployment (AWS EC2 + RDS)

### Step 1: Setup RDS MySQL Database

1. **Create RDS Instance** (via AWS Console or Infrastructure Engineer)
   - Engine: MySQL 8.0
   - Instance class: db.t3.micro (free tier)
   - Storage: 20 GB
   - Enable public access (for development)
   - Create security group allowing port 3306

2. **Update Backend .env** with RDS endpoint:
\`\`\`env
DB_HOST=your-rds-endpoint.us-east-1.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=your-secure-password
DB_NAME=restaurant_booking
\`\`\`

3. **Initialize RDS Database**:
\`\`\`bash
npm run init-db
\`\`\`

### Step 2: Setup S3 Bucket

1. **Create S3 Bucket** (via AWS Console or Infrastructure Engineer)
   - Name: \`restaurant-booking-images\`
   - Region: us-east-1
   - Uncheck "Block all public access" (for public image URLs)
   - Enable versioning (optional)

2. **Create IAM User with S3 Access**
   - Policy: AmazonS3FullAccess or custom policy
   - Generate Access Key and Secret Key

3. **Update Backend .env**:
\`\`\`env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=restaurant-booking-images
\`\`\`

### Step 3: Deploy to EC2

1. **Launch EC2 Instance**
   - AMI: Ubuntu 22.04 LTS
   - Instance type: t2.micro (free tier)
   - Security group: Allow ports 22 (SSH), 3001 (API), 80 (HTTP), 443 (HTTPS)

2. **Connect to EC2 and Install Dependencies**:
\`\`\`bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install git
sudo apt install -y git
\`\`\`

3. **Clone and Setup Application**:
\`\`\`bash
# Clone repository
git clone <your-repo-url>
cd restaurant-booking-system/backend

# Install dependencies
npm install

# Create .env with production values
nano .env
# (Paste your RDS and S3 credentials)

# Initialize database
npm run init-db

# Start application with PM2
pm2 start src/server.js --name restaurant-api
pm2 save
pm2 startup

# Check logs
pm2 logs restaurant-api
\`\`\`

4. **Configure Nginx as Reverse Proxy** (Optional but recommended):
\`\`\`bash
sudo apt install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/restaurant-api

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/restaurant-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
\`\`\`

### Step 4: Security Configuration

1. **RDS Security Group**:
   - Inbound rule: MySQL/Aurora (3306) from EC2 security group

2. **EC2 Security Group**:
   - Inbound rules:
     - SSH (22) from your IP
     - HTTP (80) from anywhere
     - HTTPS (443) from anywhere
     - Custom TCP (3001) from anywhere (or restrict to your frontend domain)

3. **S3 Bucket Policy** (Coordinate with Security Lead):
\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::restaurant-booking-images/*"
    }
  ]
}
\`\`\`

## API Endpoints

### Authentication
- \`POST /api/auth/register\` - Register new user
- \`POST /api/auth/login\` - Login user
- \`GET /api/auth/profile\` - Get user profile (authenticated)

### Bookings
- \`GET /api/bookings\` - Get bookings (user's own or all for admin)
- \`POST /api/bookings\` - Create booking
- \`GET /api/bookings/slots/:date\` - Get booked time slots
- \`PATCH /api/bookings/:id/status\` - Update booking status
- \`DELETE /api/bookings/:id\` - Delete booking (admin only)

### Menu
- \`GET /api/menu\` - Get all menu items (public)
- \`POST /api/menu\` - Create menu item with image (admin only)
- \`PUT /api/menu/:id\` - Update menu item (admin only)
- \`DELETE /api/menu/:id\` - Delete menu item (admin only)

### User Profile
- \`PUT /api/user/profile\` - Update user profile (authenticated)

## Testing

### Health Check
\`\`\`bash
curl http://localhost:3001/health
\`\`\`

### Login
\`\`\`bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@test.com","password":"customer123"}'
\`\`\`

### Create Booking
\`\`\`bash
curl -X POST http://localhost:3001/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "date":"2025-12-20",
    "timeSlot":"19:00",
    "guestCount":4
  }'
\`\`\`

## Monitoring and Logs

### PM2 Process Management
\`\`\`bash
pm2 status          # Check status
pm2 logs            # View logs
pm2 restart all     # Restart application
pm2 stop all        # Stop application
\`\`\`

### Database Health
\`\`\`bash
mysql -h your-rds-endpoint.rds.amazonaws.com -u admin -p
USE restaurant_booking;
SHOW TABLES;
SELECT COUNT(*) FROM bookings;
\`\`\`

## Troubleshooting

### Database Connection Issues
- Check RDS security group allows EC2 instance
- Verify credentials in .env
- Test connection: \`mysql -h <rds-endpoint> -u admin -p\`

### S3 Upload Issues
- Verify IAM credentials have S3 access
- Check bucket name and region
- Ensure bucket policy allows public read

### CORS Errors
- Update \`FRONTEND_URL\` in backend .env
- Restart server after changes

## Default Credentials

- **Admin**: admin@test.com / admin123
- **Customer**: customer@test.com / customer123

**⚠️ Change these credentials in production!**
