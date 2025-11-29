#!/bin/bash

set -e

echo "🚀 Smart Session Planner - Setup Script"
echo "========================================"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js (v18 or higher) from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js version 18 or higher is required"
    echo "Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Setup environment variables
echo "📝 Setting up environment variables..."

if [ ! -f "back-end/.env" ]; then
    cp back-end/.env.example back-end/.env
    echo "✅ Created back-end/.env from .env.example"
else
    echo "⚠️  back-end/.env already exists, skipping..."
fi

if [ ! -f "front-end/.env" ]; then
    cp front-end/.env.example front-end/.env
    echo "✅ Created front-end/.env from .env.example"
else
    echo "⚠️  front-end/.env already exists, skipping..."
fi

echo ""

# Setup back-end
echo "🔧 Setting up back-end..."
cd back-end

echo "📦 Installing back-end dependencies..."
npm install

echo "🗄️  Generating Prisma client..."
npm run db:generate

echo "🗄️  Pushing database schema..."
npm run db:push

echo "🌱 Seeding database with demo data..."
npm run db:seed

cd ..
echo "✅ Back-end setup complete!"
echo ""

# Setup front-end
echo "🔧 Setting up front-end..."
cd front-end

echo "📦 Installing front-end dependencies..."
npm install

cd ..
echo "✅ Front-end setup complete!"
echo ""

# Final instructions
echo "========================================="
echo "✨ Setup Complete!"
echo "========================================="
echo ""
echo "To start the application:"
echo ""
echo "1. Start the back-end server:"
echo "   cd back-end && npm run dev"
echo ""
echo "2. In a new terminal, start the front-end:"
echo "   cd front-end && npm start"
echo ""
echo "3. Run on your preferred platform:"
echo "   - Press 'i' for iOS simulator"
echo "   - Press 'a' for Android emulator"
echo "   - Press 'w' for web browser"
echo "   - Scan QR code with Expo Go app"
echo ""
echo "The API will be available at http://localhost:3001"
echo ""
