const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transactionController');
const authController = require('../controllers/authController');
const { requireAdmin } = require('../middleware/adminAuth');
const { validateCreateTransaction, validateTransactionId } = require('../middleware/validation');
const { checkTransactionOwnership } = require('../middleware/auth');

// Get all transactions for the current user (must be before /:transactionId route)
router.get('/my', authController.protect, TransactionController.getUserTransactions);

// New routes for dashboard data
router.get('/buyer-data', authController.protect, TransactionController.getBuyerData);
router.get('/seller-data', authController.protect, TransactionController.getSellerData);

// Create a new transaction
router.post('/', authController.protect, validateCreateTransaction, TransactionController.createTransaction);

// Get transaction details
router.get('/:transactionId', authController.protect, validateTransactionId, checkTransactionOwnership, TransactionController.getTransaction);

// Get transaction timeline
router.get('/:transactionId/timeline', authController.protect, validateTransactionId, checkTransactionOwnership, TransactionController.getTransactionTimeline);

// SSE: stream transaction updates
router.get('/:transactionId/stream', authController.protect, validateTransactionId, checkTransactionOwnership, TransactionController.streamTransactionUpdates);

// Transaction actions
router.post('/:transactionId/cancel', authController.protect, validateTransactionId, checkTransactionOwnership, TransactionController.cancelTransaction);
router.post('/:transactionId/pay', authController.protect, validateTransactionId, checkTransactionOwnership, TransactionController.processPayment);

// Confirm payment received
router.post('/:transactionId/confirm-payment', authController.protect, validateTransactionId, checkTransactionOwnership, TransactionController.confirmPayment);

// Upload file for transaction
router.post('/:transactionId/upload', authController.protect, validateTransactionId, checkTransactionOwnership, TransactionController.uploadFile);

// Get download URL for file
router.get('/:transactionId/download', authController.protect, validateTransactionId, checkTransactionOwnership, TransactionController.getDownloadUrl);

// Admin only: Refund transaction
router.post('/:transactionId/refund', authController.protect, requireAdmin, validateTransactionId, TransactionController.refundTransaction);

module.exports = router;