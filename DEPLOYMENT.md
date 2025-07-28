# 🚀 Deployment Guide for Kasprzysana

## Prerequisites

Before deploying, make sure you have:
- Node.js installed locally
- A MongoDB database (MongoDB Atlas recommended)
- A Heroku account (for Heroku deployment)

## Option 1: Heroku Deployment (Recommended)

### Step 1: Install Heroku CLI
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Or download from: https://devcenter.heroku.com/articles/heroku-cli
```

### Step 2: Login to Heroku
```bash
heroku login
```

### Step 3: Create Heroku App
```bash
# Create a new app
heroku create kasprzysana

# Or use an existing app
heroku git:remote -a your-app-name
```

### Step 4: Set Environment Variables
```bash
# Set production environment
heroku config:set NODE_ENV=production

# Set JWT secret (generate a strong secret)
heroku config:set JWT_SECRET=your-super-secret-jwt-key-change-this

# Set MongoDB URI (use MongoDB Atlas)
heroku config:set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kasprzysana
```

### Step 5: Deploy to Heroku
```bash
# Add all files
git add .

# Commit changes
git commit -m "Initial deployment"

# Push to Heroku
git push heroku main
```

### Step 6: Open Your App
```bash
heroku open
```

## Option 2: MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster

### Step 2: Configure Database
1. Create a database user
2. Set up network access (allow all IPs for development)
3. Get your connection string

### Step 3: Update Environment Variables
```bash
# For local development
export MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kasprzysana

# For Heroku
heroku config:set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kasprzysana
```

## Option 3: Local Development

### Step 1: Install Dependencies
```bash
# Run the setup script
./setup.sh

# Or manually:
npm install
cd client && npm install && cd ..
```

### Step 2: Set Up Environment
```bash
# Copy environment file
cp env.example .env

# Edit .env file with your settings
nano .env
```

### Step 3: Start Development Server
```bash
# Start both server and client
npm run dev

# Or start separately:
npm run server    # Backend on port 5000
cd client && npm start  # Frontend on port 3000
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/kasprzysana

# JWT Secret (change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use a strong JWT secret
- [ ] Set up MongoDB Atlas or production database
- [ ] Configure CORS for your domain
- [ ] Set up proper logging
- [ ] Configure error monitoring
- [ ] Set up SSL/HTTPS
- [ ] Configure domain name

## Troubleshooting

### Common Issues

1. **Build fails on Heroku**
   ```bash
   # Check build logs
   heroku logs --tail
   
   # Ensure all dependencies are in package.json
   npm install --save-dev
   ```

2. **Database connection fails**
   - Check MongoDB URI format
   - Ensure network access is configured
   - Verify database credentials

3. **CORS errors**
   - Update CORS configuration in server/index.js
   - Add your domain to allowed origins

4. **Authentication issues**
   - Check JWT secret is set correctly
   - Verify token expiration settings

### Useful Commands

```bash
# View Heroku logs
heroku logs --tail

# Check Heroku config
heroku config

# Restart Heroku app
heroku restart

# Run database migrations (if needed)
heroku run npm run migrate
```

## Monitoring and Maintenance

### Set Up Monitoring
```bash
# Add Heroku add-ons for monitoring
heroku addons:create papertrail:choklad
heroku addons:create newrelic:wayne
```

### Database Backups
```bash
# Set up automated backups with MongoDB Atlas
# Or use Heroku add-ons for database backups
```

## Security Considerations

1. **Environment Variables**: Never commit secrets to git
2. **JWT Secret**: Use a strong, random secret
3. **Database**: Use connection strings with authentication
4. **CORS**: Configure for specific domains in production
5. **HTTPS**: Always use HTTPS in production
6. **Rate Limiting**: Consider adding rate limiting for API endpoints

## Performance Optimization

1. **Database Indexes**: Ensure proper indexes on MongoDB collections
2. **Caching**: Consider adding Redis for session storage
3. **CDN**: Use a CDN for static assets
4. **Compression**: Enable gzip compression
5. **Image Optimization**: Optimize images and use WebP format

## Support

If you encounter issues:
1. Check the logs: `heroku logs --tail`
2. Review the README.md for setup instructions
3. Check the troubleshooting section above
4. Create an issue in the repository

---

**Happy Deploying! 🎉** 