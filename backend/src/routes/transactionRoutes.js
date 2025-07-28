const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transactionController');
const authController = require('../controllers/authController');
const { validateCreateTransaction, validateTransactionId } = require('../middleware/validation');

// Get all transactions for the current user (must be before /:transactionId route)
router.get('/my', authController.protect, TransactionController.getUserTransactions);

// New routes for dashboard data
router.get('/buyer-data', authController.protect, TransactionController.getBuyerData);
router.get('/seller-data', authController.protect, TransactionController.getSellerData);

// Create a new transaction
router.post('/', authController.protect, validateCreateTransaction, TransactionController.createTransaction);

// Get transaction details
router.get('/:transactionId', validateTransactionId, TransactionController.getTransaction);

// Get transaction timeline
router.get('/:transactionId/timeline', validateTransactionId, TransactionController.getTransactionTimeline);

// Transaction actions
router.post('/:transactionId/cancel', authController.protect, validateTransactionId, TransactionController.cancelTransaction);
router.post('/:transactionId/pay', authController.protect, validateTransactionId, TransactionController.processPayment);

// Confirm payment received
router.post('/:transactionId/confirm-payment', validateTransactionId, TransactionController.confirmPayment);

// Upload file for transaction
router.post('/:transactionId/upload', authController.protect, validateTransactionId, TransactionController.uploadFile);

// Get download URL for file
router.get('/:transactionId/download', validateTransactionId, TransactionController.getDownloadUrl);

module.exports = router;