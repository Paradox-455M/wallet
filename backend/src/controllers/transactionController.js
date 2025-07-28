const TransactionService = require('../services/transactionService');
const { upload } = require('../config/s3');
const Transaction = require('../models/Transaction');

class TransactionController {
  static async createTransaction(req, res) {
    try {
      if (!req.user || !req.user.email) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const { sellerEmail, amount, itemDescription } = req.body;
      if (!sellerEmail || !amount || !itemDescription) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const buyerEmail = req.user.email;
      console.log('req.user:', req.user);
      console.log('req.user.email:', req.user.email);
      
      const transactionId = await TransactionService.createTransaction(
        buyerEmail,
        sellerEmail,
        amount,
        itemDescription
      );

      const clientSecret = await TransactionService.initiatePayment(transactionId, amount);

      res.json({
        transactionId,
        clientSecret,
        message: 'Transaction created successfully'
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  }

  static async getTransaction(req, res) {
    try {
      const { transactionId } = req.params;
      const transaction = await TransactionService.getTransaction(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      res.json(transaction);
    } catch (error) {
      console.error('Error fetching transaction:', error);
      res.status(500).json({ error: 'Failed to fetch transaction' });
    }
  }

  static async confirmPayment(req, res) {
    try {
      const { transactionId } = req.params;
      const transaction = await TransactionService.confirmPaymentReceived(transactionId);
      
      await TransactionService.checkAndCompleteTransaction(transactionId);
      
      res.json({
        message: 'Payment confirmed successfully',
        transaction
      });
    } catch (error) {
      console.error('Error confirming payment:', error);
      res.status(500).json({ error: 'Failed to confirm payment' });
    }
  }

  static async uploadFile(req, res) {
    try {
      const { transactionId } = req.params;
      const transaction = await TransactionService.getTransaction(transactionId);

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Check if user is the seller
      if (req.user && transaction.seller_email !== req.user.email) {
        return res.status(403).json({ error: 'Only the seller can upload files' });
      }

      // File upload is handled by multer-s3 middleware
      upload.single('file')(req, res, async (err) => {
        if (err) {
          console.error('Error uploading file:', err);
          return res.status(400).json({ error: 'File upload failed' });
        }

        try {
          const fileKey = req.file.key;
          const fileName = req.file.originalname;

          const updatedTransaction = await TransactionService.updateFileInfo(
            transactionId,
            fileKey,
            fileName
          );

          await TransactionService.checkAndCompleteTransaction(transactionId);

          res.json({
            message: 'File uploaded successfully',
            transaction: updatedTransaction
          });
        } catch (error) {
          console.error('Error updating transaction with file info:', error);
          res.status(500).json({ error: 'Failed to update transaction with file info' });
        }
      });
    } catch (error) {
      console.error('Error in file upload handler:', error);
      res.status(500).json({ error: 'Failed to handle file upload' });
    }
  }

  static async getDownloadUrl(req, res) {
    try {
      const { transactionId } = req.params;
      const downloadUrl = await TransactionService.getDownloadUrl(transactionId);
      
      res.json({ downloadUrl });
    } catch (error) {
      console.error('Error generating download URL:', error);
      res.status(500).json({ error: 'Failed to generate download URL' });
    }
  }

  static async getUserTransactions(req, res) {
    try {
      if (!req.user || !req.user.email) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userEmail = req.user.email;
      const transactions = await Transaction.findByUserEmail(userEmail);

      res.json(transactions);
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      res.status(500).json({ error: 'Failed to fetch user transactions' });
    }
  }

  // New endpoint: Get buyer transactions and statistics
  static async getBuyerData(req, res) {
    try {
      if (!req.user || !req.user.email) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userEmail = req.user.email;
      const [transactions, stats] = await Promise.all([
        Transaction.findByBuyerEmail(userEmail),
        Transaction.getBuyerStats(userEmail)
      ]);

      res.json({
        transactions,
        statistics: {
          totalTransactions: parseInt(stats.total_transactions),
          pendingFiles: parseInt(stats.pending_files),
          completedTransactions: parseInt(stats.completed_transactions),
          totalSpent: parseFloat(stats.total_spent)
        }
      });
    } catch (error) {
      console.error('Error fetching buyer data:', error);
      res.status(500).json({ error: 'Failed to fetch buyer data' });
    }
  }

  // New endpoint: Get seller transactions and statistics
  static async getSellerData(req, res) {
    try {
      if (!req.user || !req.user.email) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userEmail = req.user.email;
      const [transactions, stats] = await Promise.all([
        Transaction.findBySellerEmail(userEmail),
        Transaction.getSellerStats(userEmail)
      ]);

      res.json({
        transactions,
        statistics: {
          totalUploads: parseInt(stats.total_uploads),
          totalEarned: parseFloat(stats.total_earned),
          pendingPayouts: parseFloat(stats.pending_payouts),
          downloadsCompleted: parseInt(stats.downloads_completed)
        }
      });
    } catch (error) {
      console.error('Error fetching seller data:', error);
      res.status(500).json({ error: 'Failed to fetch seller data' });
    }
  }

  // New endpoint: Cancel transaction
  static async cancelTransaction(req, res) {
    try {
      if (!req.user || !req.user.email) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { transactionId } = req.params;
      const userEmail = req.user.email;

      // Check if user has access to this transaction
      const hasAccess = await Transaction.hasAccess(transactionId, userEmail);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Only allow cancellation if payment hasn't been received
      if (transaction.payment_received) {
        return res.status(400).json({ error: 'Cannot cancel transaction after payment' });
      }

      const updatedTransaction = await Transaction.updateStatus(transactionId, 'cancelled');

      res.json({
        message: 'Transaction cancelled successfully',
        transaction: updatedTransaction
      });
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      res.status(500).json({ error: 'Failed to cancel transaction' });
    }
  }

  // New endpoint: Process payment (simulation for now)
  static async processPayment(req, res) {
    try {
      if (!req.user || !req.user.email) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { transactionId } = req.params;
      const userEmail = req.user.email;

      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Only buyer can process payment
      if (transaction.buyer_email !== userEmail) {
        return res.status(403).json({ error: 'Only the buyer can process payment' });
      }

      // Check if payment already received
      if (transaction.payment_received) {
        return res.status(400).json({ error: 'Payment already processed' });
      }

      const updatedTransaction = await Transaction.updatePaymentStatus(transactionId, true);

      res.json({
        message: 'Payment processed successfully',
        transaction: updatedTransaction
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      res.status(500).json({ error: 'Failed to process payment' });
    }
  }

  // New endpoint: Get transaction timeline/history
  static async getTransactionTimeline(req, res) {
    try {
      const { transactionId } = req.params;
      
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Build timeline events
      const timeline = [
        {
          event: 'Transaction Created',
          timestamp: transaction.created_at,
          description: `Transaction for "${transaction.item_description}" created`,
          status: 'completed'
        }
      ];

      if (transaction.payment_received) {
        timeline.push({
          event: 'Payment Received',
          timestamp: transaction.updated_at,
          description: 'Payment has been received and held in escrow',
          status: 'completed'
        });
      }

      if (transaction.file_uploaded) {
        timeline.push({
          event: 'File Uploaded',
          timestamp: transaction.updated_at,
          description: `File "${transaction.file_name}" uploaded by seller`,
          status: 'completed'
        });
      }

      if (transaction.status === 'completed') {
        timeline.push({
          event: 'Transaction Completed',
          timestamp: transaction.completed_at || transaction.updated_at,
          description: 'Funds released to seller',
          status: 'completed'
        });
      }

      res.json({
        transaction,
        timeline
      });
    } catch (error) {
      console.error('Error fetching transaction timeline:', error);
      res.status(500).json({ error: 'Failed to fetch transaction timeline' });
    }
  }
}

module.exports = TransactionController;