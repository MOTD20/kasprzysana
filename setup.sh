#!/bin/bash

echo "🚀 Setting up Kasprzysana..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   Visit: https://nodejs.org/"
    echo "   Or use: brew install node (if you have Homebrew)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install server dependencies
echo "📦 Installing server dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your MongoDB connection string and JWT secret"
fi

echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "  npm run dev          # Start both server and client"
echo "  npm run server       # Start server only"
echo "  cd client && npm start  # Start client only"
echo ""
echo "Make sure to:"
echo "  1. Set up MongoDB (local or MongoDB Atlas)"
echo "  2. Update .env file with your MongoDB URI"
echo "  3. Change JWT_SECRET in .env file" 