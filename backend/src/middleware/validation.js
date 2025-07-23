const { body, param, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Transaction validation rules
const validateCreateTransaction = [
  body('sellerEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid seller email is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number greater than 0'),
  body('itemDescription')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Item description must be between 1 and 1000 characters'),
  handleValidationErrors
];

// User registration validation rules
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('fullName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Full name must be between 1 and 100 characters'),
  handleValidationErrors
];

// User login validation rules
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Transaction ID validation
const validateTransactionId = [
  param('transactionId')
    .isUUID()
    .withMessage('Valid transaction ID is required'),
  handleValidationErrors
];

module.exports = {
  validateCreateTransaction,
  validateUserRegistration,
  validateUserLogin,
  validateTransactionId,
  handleValidationErrors
};