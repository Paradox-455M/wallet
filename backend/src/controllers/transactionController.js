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
}

module.exports = TransactionController;