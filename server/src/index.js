// Load environment variables using dotenv
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Import DB connection
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const exercisesRoutes = require('./routes/exercises');
const workoutsRoutes = require('./routes/workouts');
const progressRoutes = require('./routes/progress');

// Import error handler
const errorHandler = require('./middleware/error');

// Initialize passport
require('./config/passport');

// Connect to database
connectDB();

// Initialize app
const app = express();

// Set up Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Workout Tracker API',
      version: '1.0.0',
      description: 'API for Workout Tracker MERN application'
    },
    servers: [
      {
        url: '/api',
        description: 'API server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Middleware
app.use(express.json());
app.use(cors());

// Logging middleware in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Initialize passport
app.use(passport.initialize());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/exercises', exercisesRoutes);
app.use('/api/workouts', workoutsRoutes);
app.use('/api/progress', progressRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Home route
app.get('/', (req, res) => {
  res.send('Workout Tracker API is running');
});

// Error handler middleware
app.use(errorHandler);

// Set port - hardcode to 5001 to match client proxy setting
const PORT = 5001;

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
}); 