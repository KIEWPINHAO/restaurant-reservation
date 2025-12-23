#!/bin/bash

# Restaurant Booking System - Setup Script
# This script helps set up the project for local development

set -e  # Exit on error

echo "🍽️  Restaurant Booking System - Setup Script"
echo "============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) found${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm --version) found${NC}"
echo ""

# Setup Backend
echo "📦 Setting up backend..."
cd backend

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit backend/.env with your configuration${NC}"
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

echo "📥 Installing backend dependencies..."
npm install

echo ""
echo -e "${YELLOW}⚠️  Database Setup Required${NC}"
echo "Before running the backend, make sure you have:"
echo "  1. MySQL installed and running"
echo "  2. Created a database named 'restaurant_booking'"
echo "  3. Updated backend/.env with your MySQL credentials"
echo ""
read -p "Have you completed the database setup? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Initializing database schema..."
    npm run init-db
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database initialized successfully${NC}"
    else
        echo -e "${RED}❌ Database initialization failed${NC}"
        echo "Please check your database credentials in backend/.env"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Skipping database initialization${NC}"
    echo "Run 'cd backend && npm run init-db' when ready"
fi

cd ..

# Setup Frontend
echo ""
echo "📦 Setting up frontend..."

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from .env.example...${NC}"
    cp .env.example .env
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

echo "📥 Installing frontend dependencies..."
npm install

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "🚀 To start the development servers:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  npm run dev"
echo ""
echo "📝 Default credentials:"
echo "  Admin: admin@test.com / admin123"
echo "  Customer: customer@test.com / customer123"
echo ""
echo "📚 Documentation:"
echo "  - Backend: backend/README.md"
echo "  - Deployment: DEPLOYMENT.md"
echo "  - Project Summary: PROJECT_SUMMARY.md"
echo ""
echo -e "${YELLOW}⚠️  Remember to configure AWS S3 credentials in backend/.env for image uploads!${NC}"
