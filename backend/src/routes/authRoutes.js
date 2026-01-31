const express = require('express');
const authController = require('../controllers/authController');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');

const router = express.Router();

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', validateUserRegistration, authController.register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token (Local login)
// @access  Public
router.post('/login', validateUserLogin, authController.login);

// @route   GET api/auth/logout
// @desc    Logout user
// @access  Private (though for JWT, it's more of a client-side action)
router.get('/logout', authController.logout); // For JWT, this might just return a success message

// @route   GET api/auth/me
// @desc    Get current logged-in user (includes transactionCount)
// @access  Private
router.get('/me', authController.protect, authController.getCurrentUser);

// @route   PUT api/auth/profile
// @desc    Update current user profile (fullName)
// @access  Private
router.put('/profile', authController.protect, authController.updateProfile);

// @route   GET api/auth/google
// @desc    Authenticate with Google
// @access  Public
router.get('/google', authController.googleLogin);

// @route   GET api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback', authController.googleCallback);

// @route   GET api/auth/github
// @desc    Authenticate with GitHub
// @access  Public
router.get('/github', authController.githubLogin);

// @route   GET api/auth/github/callback
// @desc    GitHub OAuth callback
// @access  Public
router.get('/github/callback', authController.githubCallback);

module.exports = router;