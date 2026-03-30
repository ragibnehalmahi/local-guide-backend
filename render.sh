#!/bin/bash

# Render.com Deploy Script for Local Guide Backend
# Exit on error
set -o errexit

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Local Guide Backend Deploy Script   ${NC}"
echo -e "${GREEN}========================================${NC}"

# 1. Install dependencies
echo -e "${YELLOW}[1/6] Installing dependencies...${NC}"
 
npm install --include=dev --legacy-peer-deps

# 2. Install TypeScript globally if needed
echo -e "${YELLOW}[2/6] Checking TypeScript...${NC}"
if ! command -v tsc &> /dev/null; then
    echo "Installing TypeScript..."
    npm install -g typescript
fi

# 3. Run TypeScript compilation
echo -e "${YELLOW}[3/6] Building TypeScript...${NC}"
npm run build || {
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
}
echo -e "${GREEN}✅ Build successful!${NC}"

# 4. Verify build output
echo -e "${YELLOW}[4/6] Verifying build output...${NC}"
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ dist folder not found! Build may have failed.${NC}"
    exit 1
fi

if [ ! -f "dist/server.js" ]; then
    echo -e "${RED}❌ dist/server.js not found! Check your entry point.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build output verified!${NC}"

# 5. Display environment check (optional, for debugging)
echo -e "${YELLOW}[5/6] Checking environment variables...${NC}"
echo "NODE_ENV: ${NODE_ENV:-not set}"
echo "PORT: ${PORT:-5000}"
echo "MongoDB: ${DATABASE_URL:0:50}..."

# 6. Start the server
echo -e "${YELLOW}[6/6] Starting server...${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Server is starting...               ${NC}"
echo -e "${GREEN}========================================${NC}"

# Start the server
exec npm start