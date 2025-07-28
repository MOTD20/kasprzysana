#!/bin/bash

echo "🚀 Kasprzysana Deployment Script"
echo "=================================="

# Check if Heroku CLI is available
if [ ! -f "./heroku/bin/heroku" ]; then
    echo "❌ Heroku CLI not found. Please run the setup first."
    exit 1
fi

echo "📋 Step 1: Heroku Authentication"
echo "Please visit: https://dashboard.heroku.com/account"
echo "Then run: ./heroku/bin/heroku login"
echo ""
read -p "Press Enter after you've logged in to Heroku..."

echo "📋 Step 2: Create Heroku App"
echo "Creating app 'kasprzysana-app'..."
./heroku/bin/heroku create kasprzysana-app

echo "📋 Step 3: Set Environment Variables"
echo "Setting up environment variables..."

# Generate a random JWT secret
JWT_SECRET=$(openssl rand -base64 32)

./heroku/bin/heroku config:set NODE_ENV=production
./heroku/bin/heroku config:set JWT_SECRET="$JWT_SECRET"

echo "⚠️  IMPORTANT: You need to set up MongoDB Atlas and add the connection string"
echo "1. Go to https://www.mongodb.com/cloud/atlas"
echo "2. Create a free account and cluster"
echo "3. Get your connection string"
echo "4. Run: ./heroku/bin/heroku config:set MONGODB_URI='your-connection-string'"
echo ""

read -p "Press Enter after you've set up MongoDB Atlas and added the connection string..."

echo "📋 Step 4: Deploy to Heroku"
echo "Deploying your application..."
./heroku/bin/heroku git:remote -a kasprzysana-app
git add .
git commit -m "Deploy Kasprzysana to Heroku"
./heroku/bin/heroku git:push heroku main

echo "📋 Step 5: Open Your App"
echo "Opening your deployed application..."
./heroku/bin/heroku open

echo "🎉 Deployment Complete!"
echo "Your Kasprzysana app is now live at: https://kasprzysana-app.herokuapp.com"
echo ""
echo "📊 To monitor your app:"
echo "   ./heroku/bin/heroku logs --tail"
echo ""
echo "🔧 To restart your app:"
echo "   ./heroku/bin/heroku restart"
echo ""
echo "📝 To view your app configuration:"
echo "   ./heroku/bin/heroku config" 