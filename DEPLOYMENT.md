# Cloud Deployment Guide

This guide covers deploying the Restaurant Booking System to AWS Cloud infrastructure.

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                         Internet                             │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
                ┌────────────────┐
                │  Load Balancer │ (Optional - for auto-scaling)
                │   (ALB/ELB)    │
                └────────┬───────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    ┌────────┐      ┌────────┐     ┌────────┐
    │  EC2   │      │  EC2   │     │  EC2   │
    │Instance│      │Instance│     │Instance│
    │Backend │      │Backend │     │Backend │
    └────┬───┘      └────┬───┘     └────┬───┘
         │               │               │
         └───────────────┼───────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ┌─────────┐    ┌─────────┐    ┌─────────┐
    │   RDS   │    │   S3    │    │CloudWatch│
    │  MySQL  │    │ Storage │    │   Logs   │
    └─────────┘    └─────────┘    └─────────┘
```

## Prerequisites

### Required AWS Services
1. **EC2** - Virtual machine for backend
2. **RDS MySQL** - Managed database service
3. **S3** - Object storage for images
4. **IAM** - User and access management
5. **VPC** - Network isolation
6. **Security Groups** - Firewall rules
7. **CloudWatch** (Optional) - Monitoring and logging

### Tools Needed
- AWS Account
- AWS CLI (optional)
- SSH client
- Git

## Step-by-Step Deployment

### Phase 1: Database Setup (RDS)

#### 1.1 Create RDS MySQL Instance

**Via AWS Console:**
1. Navigate to RDS → Databases → Create database
2. Configuration:
   - Engine: MySQL 8.0.35
   - Template: Free tier (or Production for real use)
   - DB instance identifier: `restaurant-booking-db`
   - Master username: `admin`
   - Master password: `SecurePassword123!` (change this!)
   - DB instance class: db.t3.micro
   - Storage: 20 GB GP3
   - Storage autoscaling: Enable (max 100 GB)
   
3. Connectivity:
   - VPC: Default VPC
   - Public access: Yes (for development) / No (for production with VPN)
   - VPC security group: Create new → `restaurant-db-sg`
   - Availability Zone: No preference
   - Port: 3306

4. Additional configuration:
   - Initial database name: `restaurant_booking`
   - Enable automated backups (7 days retention)
   - Enable Enhanced monitoring (optional)

5. Click "Create database" (takes 5-10 minutes)

#### 1.2 Configure RDS Security Group

1. Go to EC2 → Security Groups → `restaurant-db-sg`
2. Inbound rules:
   - Type: MySQL/Aurora (3306)
   - Source: Custom → Select EC2 security group (created in Phase 2)
   - Description: "Allow MySQL from backend EC2"

#### 1.3 Initialize Database Schema

From your local machine or EC2:
\`\`\`bash
cd backend
# Update .env with RDS endpoint
# DB_HOST=your-db.xxxxx.us-east-1.rds.amazonaws.com

npm run init-db
\`\`\`

### Phase 2: Storage Setup (S3)

#### 2.1 Create S3 Bucket

**Via AWS Console:**
1. Navigate to S3 → Create bucket
2. Configuration:
   - Bucket name: `restaurant-booking-images-prod` (must be globally unique)
   - Region: us-east-1 (or same as EC2/RDS)
   - Object Ownership: ACLs enabled
   - Block Public Access: **Uncheck "Block all public access"**
   - Bucket Versioning: Enable (recommended)
   - Default encryption: Enable (SSE-S3)

3. Click "Create bucket"

#### 2.2 Configure Bucket Policy

1. Go to bucket → Permissions → Bucket policy
2. Add policy:
\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::restaurant-booking-images-prod/*"
    }
  ]
}
\`\`\`

#### 2.3 Create IAM User for S3 Access

1. Navigate to IAM → Users → Add user
2. User name: `restaurant-booking-s3-user`
3. Access type: Programmatic access
4. Permissions: Attach existing policies → `AmazonS3FullAccess`
5. Download credentials (Access Key ID and Secret Access Key)

**⚠️ Store credentials securely! You won't be able to retrieve the secret key again.**

### Phase 3: Backend Server Setup (EC2)

#### 3.1 Launch EC2 Instance

**Via AWS Console:**
1. Navigate to EC2 → Launch Instance
2. Configuration:
   - Name: `restaurant-booking-backend`
   - AMI: Ubuntu Server 22.04 LTS
   - Instance type: t2.micro (free tier) or t2.small (production)
   - Key pair: Create new or use existing for SSH access
   - Network settings:
     - VPC: Same as RDS
     - Auto-assign public IP: Enable
     - Create security group: `restaurant-backend-sg`
       - SSH (22) from My IP
       - HTTP (80) from Anywhere
       - HTTPS (443) from Anywhere
       - Custom TCP (3001) from Anywhere (or specific frontend IP)

3. Storage: 8 GB GP3 (default is fine)
4. Click "Launch instance"

#### 3.2 Connect to EC2 Instance

\`\`\`bash
# Download your key pair file (.pem)
chmod 400 your-key.pem

# Connect via SSH
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
\`\`\`

#### 3.3 Install Dependencies on EC2

\`\`\`bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version

# Install PM2 (process manager)
sudo npm install -g pm2

# Install git
sudo apt install -y git

# Install mysql client (for testing DB connection)
sudo apt install -y mysql-client
\`\`\`

#### 3.4 Deploy Backend Application

\`\`\`bash
# Clone repository
git clone https://github.com/your-username/restaurant-booking-system.git
cd restaurant-booking-system/backend

# Install dependencies
npm install

# Create production environment file
nano .env
\`\`\`

**Production .env file:**
\`\`\`env
# Database Configuration (RDS)
DB_HOST=your-db.xxxxx.us-east-1.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=SecurePassword123!
DB_NAME=restaurant_booking
DB_PORT=3306

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=restaurant-booking-images-prod

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-random
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration
FRONTEND_URL=http://your-ec2-frontend-ip:5173
\`\`\`

\`\`\`bash
# Initialize database (if not done already)
npm run init-db

# Test the server
npm start
# Press Ctrl+C to stop

# Start with PM2
pm2 start src/server.js --name restaurant-api
pm2 save
pm2 startup  # Follow the command it outputs

# Check status
pm2 status
pm2 logs restaurant-api
\`\`\`

#### 3.5 Configure Nginx Reverse Proxy (Recommended)

\`\`\`bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/restaurant-api
\`\`\`

**Nginx configuration:**
\`\`\`nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or EC2 public IP

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /health {
        proxy_pass http://localhost:3001/health;
    }
}
\`\`\`

\`\`\`bash
# Enable site
sudo ln -s /etc/nginx/sites-available/restaurant-api /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
\`\`\`

### Phase 4: Frontend Deployment

#### 4.1 Build Frontend for Production

On your local machine:
\`\`\`bash
cd restaurant-booking-system

# Update API URL in .env
echo "VITE_API_URL=http://<EC2-PUBLIC-IP>/api" > .env

# Build
npm run build
\`\`\`

#### 4.2 Deploy Frontend to EC2 (Simple Approach)

\`\`\`bash
# On EC2 instance
mkdir -p /var/www/restaurant-booking

# On your local machine, copy build files
scp -i your-key.pem -r dist/* ubuntu@<EC2-IP>:/var/www/restaurant-booking/
\`\`\`

#### 4.3 Configure Nginx for Frontend

\`\`\`bash
# On EC2
sudo nano /etc/nginx/sites-available/restaurant-frontend
\`\`\`

\`\`\`nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/restaurant-booking;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        # ... (same proxy settings as above)
    }
}
\`\`\`

\`\`\`bash
sudo ln -s /etc/nginx/sites-available/restaurant-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
\`\`\`

### Phase 5: Testing and Verification

#### 5.1 Test Backend

\`\`\`bash
# Health check
curl http://<EC2-IP>:3001/health

# Or via Nginx
curl http://<EC2-IP>/health
\`\`\`

#### 5.2 Test Database Connection

\`\`\`bash
mysql -h your-db.xxxxx.rds.amazonaws.com -u admin -p
# Enter password

USE restaurant_booking;
SHOW TABLES;
SELECT * FROM users;
exit
\`\`\`

#### 5.3 Test S3 Upload

Try uploading a menu item image through the admin panel.

### Phase 6: Auto-Scaling Setup (Optional)

#### 6.1 Create AMI from EC2 Instance

1. EC2 → Instances → Select your instance → Actions → Image and templates → Create image
2. Name: `restaurant-booking-backend-v1`
3. Create image

#### 6.2 Create Launch Template

1. EC2 → Launch Templates → Create launch template
2. Use the AMI created above
3. Same instance type and security group

#### 6.3 Create Auto Scaling Group

1. EC2 → Auto Scaling Groups → Create Auto Scaling group
2. Use the launch template
3. Minimum capacity: 1
4. Desired capacity: 2
5. Maximum capacity: 4
6. Scaling policies: Target tracking (CPU 70%)

#### 6.4 Create Load Balancer

1. EC2 → Load Balancers → Create Application Load Balancer
2. Listeners: HTTP (80), HTTPS (443)
3. Target group: Your Auto Scaling group
4. Health check: `/health`

## Monitoring and Maintenance

### CloudWatch Logs

\`\`\`bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb

# Configure and start
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json \
  -s
\`\`\`

### Regular Maintenance

\`\`\`bash
# Update application
cd restaurant-booking-system/backend
git pull
npm install
pm2 restart restaurant-api

# View logs
pm2 logs restaurant-api

# Monitor resources
htop
df -h
free -h
\`\`\`

## Security Checklist

- [ ] RDS: Public access disabled in production
- [ ] EC2: SSH restricted to specific IPs
- [ ] S3: Bucket policy reviewed with Security Lead
- [ ] Environment variables: Not committed to git
- [ ] JWT secret: Strong random string (32+ chars)
- [ ] Database passwords: Changed from default
- [ ] HTTPS: SSL certificate installed (Let's Encrypt)
- [ ] Security groups: Minimal required ports only
- [ ] IAM: Least privilege principle applied
- [ ] Backups: RDS automated backups enabled

## Troubleshooting

### Cannot connect to RDS
- Check security group allows EC2 instance
- Verify credentials
- Test from EC2: \`mysql -h <rds-endpoint> -u admin -p\`

### S3 upload fails
- Verify IAM credentials
- Check bucket policy
- Ensure bucket name matches .env

### Backend not accessible
- Check PM2 status: \`pm2 status\`
- View logs: \`pm2 logs\`
- Check Nginx: \`sudo systemctl status nginx\`
- Check security group allows port 80/3001

### CORS errors
- Update \`FRONTEND_URL\` in backend .env
- Restart backend: \`pm2 restart restaurant-api\`

## Cost Estimation (AWS Free Tier)

- EC2 t2.micro: Free for 12 months (750 hours/month)
- RDS db.t3.micro: Free for 12 months (750 hours/month)
- S3: 5 GB free storage, 20,000 GET requests
- Data Transfer: 100 GB/month free

**After free tier (~$30-50/month):**
- EC2: ~$8/month
- RDS: ~$15/month
- S3: ~$1/month
- Data transfer: Variable

## Support

For issues related to:
- **Infrastructure**: Contact Infrastructure Engineer (Role 1)
- **Security**: Contact Security Lead (Role 3)  
- **Application bugs**: Open GitHub issue
