const TransactionService = require('../services/transactionService');
const Transaction = require('../models/Transaction');
const { emitTransactionUpdate, subscribeToTransaction } = require('../services/eventBus');
const { uploadMemory } = require('../config/upload');
const { encryptBuffer, decryptToBuffer } = require('../services/cryptoService');
const TransactionFile = require('../models/TransactionFile');

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
      
      const transactionId = await TransactionService.createTransaction(
        buyerEmail,
        sellerEmail,
        amount,
        itemDescription
      );

      const clientSecret = await TransactionService.initiatePayment(transactionId, amount);

      // Emit creation event
      emitTransactionUpdate(transactionId, { type: 'created', amount, itemDescription, buyerEmail, sellerEmail });

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
      
      // Emit payment confirmed
      emitTransactionUpdate(transactionId, { type: 'payment_confirmed', amount: transaction.amount });

      const checkedTransaction = await TransactionService.checkAndCompleteTransaction(transactionId);
      
      if (checkedTransaction.status === 'completed') {
        emitTransactionUpdate(transactionId, { type: 'completed', amount: checkedTransaction.amount });
      }
      
      res.json({
        message: 'Payment confirmed successfully',
        transaction: checkedTransaction
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

      // Use memory upload
      uploadMemory.single('file')(req, res, async (err) => {
        if (err) {
          return res.status(err.statusCode || 400).json({ error: err.message || 'File upload failed' });
        }

        try {
          if (!req.file || !req.file.buffer) {
            return res.status(400).json({ error: 'No file provided' });
          }

          const { originalname, mimetype, size, buffer } = req.file;

          // Encrypt in memory
          const { wrappedKey, iv, tag, ciphertext } = encryptBuffer(buffer);

          // Store encrypted file
          await TransactionFile.create({
            transactionId,
            filename: originalname,
            mime: mimetype,
            sizeBytes: size,
            encKey: wrappedKey,
            encIv: iv,
            encTag: tag,
            encBlob: ciphertext,
          });

          // Update transaction status so workflow can proceed
          await Transaction.updateFileStatus(transactionId, 'n/a', originalname);

          // Emit file uploaded
          emitTransactionUpdate(transactionId, { type: 'file_uploaded', fileName: originalname });

          const checkedTransaction = await TransactionService.checkAndCompleteTransaction(transactionId);

          if (checkedTransaction.status === 'completed') {
            emitTransactionUpdate(transactionId, { type: 'completed', amount: checkedTransaction.amount });
          }

          res.json({
            message: 'File uploaded successfully',
            transaction: checkedTransaction,
          });
        } catch (error) {
          console.error('Error storing encrypted file:', error);
          res.status(500).json({ error: 'Failed to store encrypted file' });
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
      // Instead of URL, stream decrypted file if requester is buyer
      const transaction = await TransactionService.getTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      if (!req.user || (req.user.email !== transaction.buyer_email && req.user.email !== transaction.seller_email)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Fetch latest file metadata
      const meta = await TransactionFile.findLatestMetadataByTransactionId(transactionId);
      if (!meta) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Get encrypted parts
      const parts = await TransactionFile.getEncryptedParts(meta.id);
      if (!parts) {
        return res.status(404).json({ error: 'File data not found' });
      }

      // Decrypt fully into memory then send (for simplicity; can be chunked/streamed in future)
      const plaintext = decryptToBuffer(parts.enc_key, parts.enc_iv, parts.enc_tag, parts.enc_blob);

      res.setHeader('Content-Type', parts.mime);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(parts.filename)}"`);
      res.setHeader('Content-Length', String(parts.size_bytes));
      return res.end(plaintext);
    } catch (error) {
      console.error('Error serving download:', error);
      res.status(500).json({ error: 'Failed to serve download' });
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

      // Emit cancelled event
      emitTransactionUpdate(transactionId, { type: 'cancelled' });

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

      // Emit payment processed (simulation)
      emitTransactionUpdate(transactionId, { type: 'payment_processed', amount: updatedTransaction.amount });

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

  // Server-Sent Events stream for real-time transaction updates
  static async streamTransactionUpdates(req, res) {
    const { transactionId } = req.params;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send initial event to confirm connection
    res.write(`event: connected\n`);
    res.write(`data: {"transactionId":"${transactionId}"}\n\n`);

    const listener = (event) => {
      res.write(`event: update\n`);
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    const unsubscribe = subscribeToTransaction(transactionId, listener);

    // Keep-alive ping every 25s to prevent intermediary timeouts
    const keepAlive = setInterval(() => {
      res.write(`event: ping\n`);
      res.write(`data: ${Date.now()}\n\n`);
    }, 25000);

    req.on('close', () => {
      clearInterval(keepAlive);
      unsubscribe();
      res.end();
    });
  }
}

module.exports = TransactionController;