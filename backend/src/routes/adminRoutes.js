const express = require('express');
const authController = require('../controllers/authController');
const { requireAdmin } = require('../middleware/adminAuth');
const { validateTransactionId } = require('../middleware/validation');
const adminController = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication + admin
router.use(authController.protect);
router.use(requireAdmin);

// GET /api/admin/transactions - List all transactions (?limit= &offset= &status=)
router.get('/transactions', adminController.listTransactions);

// GET /api/admin/transactions/:transactionId - Get any transaction
router.get('/transactions/:transactionId', validateTransactionId, adminController.getTransaction);

// POST /api/admin/transactions/:transactionId/cancel - Cancel transaction (admin)
router.post('/transactions/:transactionId/cancel', validateTransactionId, adminController.cancelTransaction);

module.exports = router;
