const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transactionController');
const authController = require('../controllers/authController');

// Create a new transaction
router.post('/', authController.protect, TransactionController.createTransaction);

// Get transaction details
router.get('/:transactionId', TransactionController.getTransaction);

// Confirm payment received
router.post('/:transactionId/confirm-payment', TransactionController.confirmPayment);

// Upload file for transaction
router.post('/:transactionId/upload', TransactionController.uploadFile);

// Get download URL for file
router.get('/:transactionId/download', TransactionController.getDownloadUrl);

// Get all transactions for the current user
router.get('/my', authController.protect, TransactionController.getUserTransactions);

module.exports = router;