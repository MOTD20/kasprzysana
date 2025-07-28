# Kasprzysana - Task Management Application

A modern, full-stack task management application built with React, Node.js, and MongoDB. Inspired by Asana, Kasprzysana provides a comprehensive solution for project and task management.

## 🚀 Features

### Core Features
- **User Authentication**: Secure login/register with JWT tokens
- **Project Management**: Create, edit, and organize projects
- **Task Management**: Create tasks with priorities, due dates, and assignees
- **Team Collaboration**: Add team members to projects with different roles
- **Real-time Updates**: Modern UI with instant feedback
- **Responsive Design**: Works perfectly on desktop and mobile

### Advanced Features
- **Task Status Tracking**: Todo, In Progress, Review, Done
- **Priority Levels**: Low, Medium, High, Urgent
- **Due Date Management**: Set and track task deadlines
- **Comments System**: Add comments to tasks
- **File Attachments**: Upload files to tasks
- **Search & Filter**: Find tasks quickly with advanced filtering
- **Statistics Dashboard**: Overview of projects and tasks

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Query** - Data fetching
- **React Hook Form** - Form handling
- **Framer Motion** - Animations
- **Heroicons** - Icons

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kasprzysana
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Copy environment example
   cp env.example .env
   
   # Edit .env file with your configuration
   nano .env
   ```

4. **Database Setup**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in your `.env` file

5. **Start the application**
   ```bash
   # Development mode (runs both server and client)
   npm run dev
   
   # Or run separately:
   # Server only
   npm run server
   
   # Client only
   cd client && npm start
   ```

## 🚀 Deployment

### Heroku Deployment

1. **Create Heroku App**
   ```bash
   heroku create kasprzysana
   ```

2. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-super-secret-jwt-key
   heroku config:set MONGODB_URI=your-mongodb-connection-string
   ```

3. **Deploy**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push heroku main
   ```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   export NODE_ENV=production
   export PORT=5000
   export MONGODB_URI=your-mongodb-connection-string
   export JWT_SECRET=your-super-secret-jwt-key
   ```

3. **Start the server**
   ```bash
   npm start
   ```

## 📁 Project Structure

```
kasprzysana/
├── server/                 # Backend code
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── index.js          # Server entry point
├── client/                # Frontend code
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   └── App.tsx       # Main app component
│   └── public/           # Static files
├── package.json          # Root package.json
└── README.md            # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Projects
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add member
- `DELETE /api/projects/:id/members/:userId` - Remove member

### Tasks
- `GET /api/tasks` - Get tasks with filtering
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/comments` - Add comment
- `PATCH /api/tasks/:id/archive` - Archive task

### Users
- `GET /api/users` - Get users (for member selection)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user (admin only)
- `GET /api/users/:id/stats` - Get user statistics

## 🎨 UI Components

The application uses a consistent design system with:
- **Color Scheme**: Primary blue with gray accents
- **Typography**: Inter font family
- **Components**: Reusable card, button, and form components
- **Responsive**: Mobile-first design approach
- **Animations**: Smooth transitions and micro-interactions

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: Server-side validation with express-validator
- **CORS Protection**: Configured for production use
- **Helmet**: Security headers
- **Rate Limiting**: Protection against abuse

## 🧪 Testing

```bash
# Run client tests
cd client && npm test

# Run server tests (when implemented)
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Asana's task management interface
- Built with modern web technologies
- Designed for optimal user experience

## 📞 Support

For support, email support@kasprzysana.com or create an issue in the repository.

---

**Kasprzysana** - Modern task management for modern teams. 