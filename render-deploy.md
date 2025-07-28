# 🚀 Deploy Kasprzysana to Render (Free Alternative)

## Why Render?
- ✅ Free hosting (no credit card required)
- ✅ Easy deployment from GitHub
- ✅ Automatic deployments
- ✅ MongoDB Atlas integration
- ✅ Similar to Heroku

## Step 1: Set Up MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier)
4. Set up database access (create user/password)
5. Set up network access (allow all IPs: 0.0.0.0/0)
6. Get your connection string

## Step 2: Create GitHub Repository
1. Go to [GitHub](https://github.com)
2. Create a new repository called "kasprzysana"
3. Push your code to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/kasprzysana.git
   git push -u origin main
   ```

## Step 3: Deploy to Render
1. Go to [Render](https://render.com)
2. Sign up with your GitHub account
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - **Name**: kasprzysana
   - **Environment**: Node
   - **Build Command**: `npm install && cd client && npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

## Step 4: Set Environment Variables
In Render dashboard, add these environment variables:
- `NODE_ENV`: production
- `JWT_SECRET`: (generate a random string)
- `MONGODB_URI`: (your MongoDB Atlas connection string)

## Step 5: Deploy
Click "Create Web Service" and Render will automatically deploy your app!

## Your App Will Be Live At:
`https://kasprzysana.onrender.com`

## Alternative: Railway
Railway is another great free alternative:
1. Go to [Railway](https://railway.app)
2. Sign up with GitHub
3. Create new project
4. Deploy from GitHub repository
5. Set environment variables
6. Your app will be live instantly!

## Alternative: Vercel
For frontend-only deployment:
1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Deploy automatically
4. Connect to your backend API

## Quick Commands for GitHub Setup:
```bash
# Initialize git and push to GitHub
git init
git add .
git commit -m "Initial commit - Kasprzysana"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kasprzysana.git
git push -u origin main
```

## Environment Variables Template:
```env
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kasprzysana
```

## 🎉 Success!
Once deployed, you'll have your Kasprzysana app live on the internet! 