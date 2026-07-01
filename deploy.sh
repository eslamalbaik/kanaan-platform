#!/bin/bash

# Kanaan Platform Deployment Script
# This script builds and runs the entire application with Docker

set -e

echo "🚀 Kanaan Platform Deployment Script"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed!${NC}"
    echo "Install Docker from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found, creating default...${NC}"
    cat > .env << EOF
# Kanaan Platform Environment Variables
JWT_SECRET=kanaan-super-secret-key-change-this-in-production
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
NODE_ENV=production
EOF
    echo -e "${YELLOW}⚠️  Please update .env with your actual values!${NC}"
fi

# Stop any existing containers
echo -e "${YELLOW}⏹️  Stopping existing containers...${NC}"
docker-compose down 2>/dev/null || true

# Build images
echo -e "${YELLOW}🔨 Building Docker images...${NC}"
docker-compose build --no-cache

# Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker-compose up -d

# Wait for services to start
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 10

# Check if backend is healthy
echo -e "${YELLOW}🏥 Checking backend health...${NC}"
for i in {1..30}; do
    if docker-compose exec -T backend curl -f http://localhost:3000/v1/products > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is healthy!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Backend failed to start${NC}"
        docker-compose logs backend
        exit 1
    fi
    echo "  Attempt $i/30..."
    sleep 1
done

echo ""
echo -e "${GREEN}✅ Deployment successful!${NC}"
echo ""
echo "🎉 Your application is running at:"
echo -e "   Frontend: ${GREEN}http://localhost${NC}"
echo -e "   Backend API: ${GREEN}http://localhost:3000/v1${NC}"
echo -e "   MongoDB: ${GREEN}localhost:27017${NC}"
echo ""
echo "📝 Useful commands:"
echo "   View logs:     docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart:       docker-compose restart"
echo "   Shell backend: docker-compose exec backend sh"
echo ""
