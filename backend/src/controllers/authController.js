const User = require('../models/User');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const EmailService = require('../services/emailService');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, fullName } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    let user = await User.findByEmail(email);
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = await User.create(email, password, fullName);
    const token = generateToken(user);
    
    // Send welcome email
    await EmailService.sendWelcomeEmail(user.email, user.full_name);
    
    res.status(201).json({ token, user: { id: user.id, email: user.email, fullName: user.full_name, createdAt: user.created_at } });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Server error during login' });
    }
    if (!user) {
      return res.status(401).json({ message: info.message || 'Login failed' });
    }
    const token = generateToken(user);
    return res.json({ token, user: { id: user.id, email: user.email, fullName: user.full_name, avatarUrl: user.google_avatar_url || user.github_avatar_url } });
  })(req, res, next);
};

exports.logout = (req, res) => {
  // For JWT, logout is typically handled client-side by deleting the token.
  // If using sessions, req.logout() would be here.
  res.json({ message: 'Logout successful' });
};

exports.getCurrentUser = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  // req.user is populated by passport.deserializeUser or a JWT authentication middleware
  res.json({ user: { id: req.user.id, email: req.user.email, fullName: req.user.full_name, avatarUrl: req.user.google_avatar_url || req.user.github_avatar_url, createdAt: req.user.created_at } });
};

// Google OAuth
exports.googleLogin = passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' });

exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false, failureRedirect: process.env.FRONTEND_URL + '/login?error=google_failed' }, (err, user, info) => {
    if (err) { 
      console.error('Google auth error:', err);
      return res.redirect(process.env.FRONTEND_URL + '/login?error=google_auth_error');
    }
    if (!user) { 
      return res.redirect(process.env.FRONTEND_URL + '/login?error=google_no_user');
    }
    const token = generateToken(user);
    // Redirect to frontend with token, or set cookie
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  })(req, res, next);
};

// GitHub OAuth
exports.githubLogin = passport.authenticate('github', { scope: ['user:email'] });

exports.githubCallback = (req, res, next) => {
  passport.authenticate('github', { session: false, failureRedirect: process.env.FRONTEND_URL + '/login?error=github_failed' }, (err, user, info) => {
    if (err) { 
      console.error('GitHub auth error:', err);
      return res.redirect(process.env.FRONTEND_URL + '/login?error=github_auth_error');
    }
    if (!user) { 
      return res.redirect(process.env.FRONTEND_URL + '/login?error=github_no_user');
    }
    const token = generateToken(user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  })(req, res, next);
};

// Middleware to protect routes
exports.protect = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache');
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
        return res.status(500).json({ message: 'Server error during authentication' });
    }
    if (!user) {
        // Check if info exists and has a message (e.g., from jwt.JsonWebTokenError or jwt.TokenExpiredError)
        const message = info && info.message ? info.message : 'Unauthorized: Invalid or expired token';
        return res.status(401).json({ message });
    }
    req.user = user; // Forward user information to the next middleware/handler
    next();
  })(req, res, next);
};