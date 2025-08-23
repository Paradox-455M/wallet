const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const passport = require('./config/passport'); // Your passport configuration
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('./models/User'); // Assuming User model path

// Load environment variables
dotenv.config();

// Initialize database tables
const { createTables } = require('./migrations/001_create_tables');
(async () => {
  try {
    await createTables();
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
})();

const app = express();

// Security & middleware
app.use(helmet());

const allowedOrigin = process.env.FRONTEND_URL || '*';
app.use(cors({
  origin: allowedOrigin === '*' ? true : allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));

// Session middleware - optional for OAuth flows
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_very_secret_key_for_session',
  resave: false,
  saveUninitialized: false,
}));

// Passport middleware
app.use(passport.initialize());

// Rate limiting for API
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use('/api', apiLimiter);

// Routes
const transactionRoutes = require('./routes/transactionRoutes');
const authRoutes = require('./routes/authRoutes'); // Import auth routes

app.use('/api/transactions', transactionRoutes);
app.use('/api/auth', authRoutes); // Use auth routes

// Import error handling middleware
const { globalErrorHandler, handleNotFound } = require('./middleware/errorHandler');

// Handle unhandled routes
app.use(handleNotFound);

// Global error handling middleware
app.use(globalErrorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;