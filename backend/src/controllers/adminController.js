const Transaction = require('../models/Transaction');
const { emitTransactionUpdate } = require('../services/eventBus');
const NotificationService = require('../services/notificationService');

/**
 * Admin-only endpoints. All routes must use authController.protect + requireAdmin.
 */

// GET /api/admin/transactions - List all transactions (optional ?limit= &offset= &status=)
async function listTransactions(req, res) {
  try {
    const limit = req.query.limit;
    const offset = req.query.offset;
    const status = req.query.status;
    const transactions = await Transaction.findAll({ limit, offset, status });
    res.json({ transactions, count: transactions.length });
  } catch (err) {
    console.error('Admin listTransactions error:', err);
    res.status(500).json({ error: 'Failed to list transactions' });
  }
}

// GET /api/admin/transactions/:transactionId - Get any transaction by ID
async function getTransaction(req, res) {
  try {
    const { transactionId } = req.params;
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (err) {
    console.error('Admin getTransaction error:', err);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
}

// POST /api/admin/transactions/:transactionId/cancel - Cancel any transaction (admin can cancel even after payment)
async function cancelTransaction(req, res) {
  try {
    const { transactionId } = req.params;
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    if (transaction.status === 'cancelled') {
      return res.status(400).json({ error: 'Transaction is already cancelled' });
    }
    if (transaction.status === 'refunded') {
      return res.status(400).json({ error: 'Cannot cancel a refunded transaction' });
    }
    if (transaction.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel a completed transaction. Use refund if needed.' });
    }

    const updatedTransaction = await Transaction.updateStatus(transactionId, 'cancelled');
    emitTransactionUpdate(transactionId, { type: 'cancelled' });
    await NotificationService.notifyTransactionCancelled(
      transactionId,
      transaction.buyer_email,
      transaction.seller_email
    );

    res.json({
      message: 'Transaction cancelled by admin',
      transaction: updatedTransaction,
    });
  } catch (err) {
    console.error('Admin cancelTransaction error:', err);
    res.status(500).json({ error: 'Failed to cancel transaction' });
  }
}

module.exports = {
  listTransactions,
  getTransaction,
  cancelTransaction,
};
