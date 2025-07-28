const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

// Check if all required dependencies are available
try {
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  console.log('✅ All dependencies loaded successfully');
  console.log('bcryptjs version:', bcrypt.version);
  console.log('jsonwebtoken version:', jwt.version);
} catch (error) {
  console.error('❌ Dependency error:', error.message);
  process.exit(1);
}

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
const connectDB = async () => {
  try {
    // Clean up the MongoDB URI to remove any spaces
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kasprzysana';
    const cleanUri = mongoUri.trim().replace(/\s+/g, '');
    
    console.log('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(cleanUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('MongoDB URI (sanitized):', process.env.MONGODB_URI ? '***' : 'mongodb://localhost:27017/kasprzysana');
    process.exit(1);
  }
};

connectDB();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    hasMongoUri: !!process.env.MONGODB_URI,
    nodeEnv: process.env.NODE_ENV
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 