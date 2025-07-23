const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transactionController');
const authController = require('../controllers/authController');
const { validateCreateTransaction, validateTransactionId } = require('../middleware/validation');

// Get all transactions for the current user (must be before /:transactionId route)
router.get('/my', authController.protect, TransactionController.getUserTransactions);

// Create a new transaction
router.post('/', authController.protect, validateCreateTransaction, TransactionController.createTransaction);

// Get transaction details
router.get('/:transactionId', validateTransactionId, TransactionController.getTransaction);

// Confirm payment received
router.post('/:transactionId/confirm-payment', validateTransactionId, TransactionController.confirmPayment);

// Upload file for transaction
router.post('/:transactionId/upload', validateTransactionId, TransactionController.uploadFile);

// Get download URL for file
router.get('/:transactionId/download', validateTransactionId, TransactionController.getDownloadUrl);

module.exports = router;