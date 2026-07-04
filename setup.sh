#!/bin/bash

# Exit immediately if any command fails
set -e

#  Color coded outputs for better Developer Experience (DX)
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Vault-Hub Local Environment Setup...${NC}\n"

# Step 1: Environment Variables Setup
echo -e "${YELLOW}⚙️  Step 1: Setting up environment variables...${NC}"
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created root .env from .env.example. (Please update with actual credentials later)${NC}"
  else
    echo -e "${RED}❌ Warning: .env.example not found in root.${NC}"
  fi
else
  echo -e "${GREEN}✅ Root .env already exists. Skipping.${NC}"
fi
echo ""

# Step 2: Database / Docker Setup
# The repo contains a docker-compose.yml, usually used for local databases.
echo -e "${YELLOW}🐳 Step 2: Spinning up Docker containers (Database, etc.)...${NC}"
if command -v docker-compose &> /dev/null; then
    docker-compose up -d
    echo -e "${GREEN}✅ Docker containers started in detached mode.${NC}"
else
    echo -e "${RED}❌ Warning: docker-compose is not installed. You may need to start your DB manually.${NC}"
fi
echo ""

# Step 3: Backend Setup (Dependencies & Prisma)
echo -e "${YELLOW}📦 Step 3: Installing Backend dependencies...${NC}"
cd backend
npm install

echo -e "${YELLOW}🗄️ Generating Prisma Client...${NC}"
npx prisma generate
# Optional: If you want the script to auto-migrate the local DB, uncomment the next line.
# npx prisma db push 

cd ..
echo -e "${GREEN}✅ Backend setup complete.${NC}\n"

# Step 4: Frontend Setup
echo -e "${YELLOW}🎨 Step 4: Installing Frontend dependencies...${NC}"
cd frontend
npm install
cd ..
echo -e "${GREEN}✅ Frontend setup complete.${NC}\n"

echo -e "${GREEN}🎉 Setup Complete! Your local environment is ready.${NC}"
echo -e "---------------------------------------------------"
echo -e "To start the development servers, run:"
echo -e "  Backend : cd backend && npm run dev"
echo -e "  Frontend: cd frontend && npm run dev"
echo -e "---------------------------------------------------"