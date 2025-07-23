const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const session = require('express-session');
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

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Session middleware - required for Passport session (though we'll primarily use JWT for API auth)
// If you don't plan to use server-side sessions at all with Passport (e.g. for OAuth redirects before token generation),
// you might not strictly need express-session, but it's often included with Passport setups.
// For pure JWT, this might be optional or configured differently.
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_very_secret_key_for_session',
  resave: false,
  saveUninitialized: false,
  // cookie: { secure: process.env.NODE_ENV === 'production' } // Use secure cookies in production
}));

// Passport middleware
app.use(passport.initialize());
// app.use(passport.session()); // If using persistent login sessions with cookies

// JWT Strategy is configured in passport.js

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