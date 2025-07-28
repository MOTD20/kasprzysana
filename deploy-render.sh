#!/bin/bash

echo "🚀 Kasprzysana Render Deployment"
echo "=================================="

echo "📋 Step 1: Set up MongoDB Atlas"
echo "1. Go to https://www.mongodb.com/cloud/atlas"
echo "2. Create a free account and cluster"
echo "3. Set up database access (create user/password)"
echo "4. Set up network access (allow all IPs: 0.0.0.0/0)"
echo "5. Get your connection string"
echo ""

read -p "Press Enter after you've set up MongoDB Atlas..."

echo "📋 Step 2: Create GitHub Repository"
echo "1. Go to https://github.com"
echo "2. Create a new repository called 'kasprzysana'"
echo "3. Copy the repository URL"
echo ""

read -p "Enter your GitHub repository URL (e.g., https://github.com/username/kasprzysana.git): " GITHUB_URL

if [ -z "$GITHUB_URL" ]; then
    echo "❌ GitHub URL is required. Please run the script again."
    exit 1
fi

echo "📋 Step 3: Push to GitHub"
echo "Adding remote and pushing to GitHub..."

git remote add origin "$GITHUB_URL"
git branch -M main
git push -u origin main

echo "✅ Code pushed to GitHub!"

echo "📋 Step 4: Deploy to Render"
echo "1. Go to https://render.com"
echo "2. Sign up with your GitHub account"
echo "3. Click 'New +' → 'Web Service'"
echo "4. Connect your GitHub repository"
echo "5. Configure the service:"
echo "   - Name: kasprzysana"
echo "   - Environment: Node"
echo "   - Build Command: npm install && cd client && npm install && npm run build"
echo "   - Start Command: npm start"
echo "   - Plan: Free"
echo ""

echo "📋 Step 5: Set Environment Variables in Render"
echo "Add these environment variables in Render dashboard:"
echo ""
echo "NODE_ENV=production"
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "MONGODB_URI=your-mongodb-connection-string"
echo ""

read -p "Press Enter after you've set up Render and added environment variables..."

echo "🎉 Deployment Complete!"
echo "Your Kasprzysana app will be live at: https://kasprzysana.onrender.com"
echo ""
echo "📊 To monitor your deployment:"
echo "   - Check Render dashboard for build logs"
echo "   - Monitor your app at the provided URL"
echo ""
echo "🔧 If you need to update your app:"
echo "   git add ."
echo "   git commit -m 'Update app'"
echo "   git push origin main"
echo "   (Render will automatically redeploy)" 