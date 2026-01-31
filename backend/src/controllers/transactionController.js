const TransactionService = require('../services/transactionService');
const Transaction = require('../models/Transaction');
const { emitTransactionUpdate, subscribeToTransaction } = require('../services/eventBus');
const { uploadMemory } = require('../config/upload');
const { encryptBuffer, decryptToBuffer } = require('../services/cryptoService');
const TransactionFile = require('../models/TransactionFile');
const NotificationService = require('../services/notificationService');
const { checkUploadedFile, MAX_FILE_SIZE_BYTES } = require('../middleware/fileValidation');

class TransactionController {
  static async createTransaction(req, res) {
    try {
      if (!req.user || !req.user.email) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const { sellerEmail, buyerEmail, amount, itemDescription } = req.body;
      const userEmail = req.user.email.toLowerCase();

      // Validation: amount and item description always required
      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: 'Please provide a valid amount greater than 0' });
      }
      if (!itemDescription || !itemDescription.trim() || itemDescription.trim().length < 5) {
        return res.status(400).json({ error: 'Item description must be at least 5 characters long' });
      }

      let buyerEmailFinal;
      let sellerEmailFinal;

      // Mode 1: Create as buyer (I pay) — provide seller's email
      if (sellerEmail && String(sellerEmail).trim()) {
        const seller = String(sellerEmail).trim().toLowerCase();
        if (!seller.includes('@') || !seller.includes('.')) {
          return res.status(400).json({ error: 'Please provide a valid seller email address' });
        }
        if (seller === userEmail) {
          return res.status(400).json({ error: 'You cannot create a transaction with yourself' });
        }
        buyerEmailFinal = userEmail;
        sellerEmailFinal = seller;
      }
      // Mode 2: Create as seller (I receive) — provide buyer's email
      else if (buyerEmail && String(buyerEmail).trim()) {
        const buyer = String(buyerEmail).trim().toLowerCase();
        if (!buyer.includes('@') || !buyer.includes('.')) {
          return res.status(400).json({ error: 'Please provide a valid buyer email address' });
        }
        if (buyer === userEmail) {
          return res.status(400).json({ error: 'You cannot create a transaction with yourself' });
        }
        buyerEmailFinal = buyer;
        sellerEmailFinal = userEmail;
      }
      else {
        return res.status(400).json({ error: 'Provide either seller email (you are the buyer) or buyer email (you are the seller)' });
      }

      const parsedAmount = parseFloat(amount);

      const transactionId = await TransactionService.createTransaction(
        buyerEmailFinal,
        sellerEmailFinal,
        parsedAmount,
        itemDescription.trim()
      );

      const clientSecret = await TransactionService.initiatePayment(transactionId, parsedAmount);

      // Emit creation event
      emitTransactionUpdate(transactionId, { 
        type: 'created', 
        amount: parsedAmount, 
        itemDescription: itemDescription.trim(), 
        buyerEmail: buyerEmailFinal, 
        sellerEmail: sellerEmailFinal 
      });

      res.json({
        transactionId,
        clientSecret,
        message: 'Transaction created successfully'
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      
      // Provide more specific error messages
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        return res.status(400).json({ error: 'A transaction with these details already exists' });
      }
      
      res.status(500).json({ 
        error: 'Failed to create transaction',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async getTransaction(req, res) {
    try {
      const { transactionId } = req.params;
      const transaction = await TransactionService.getTransaction(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // If payment not received and payment intent exists, get client secret
      let clientSecret = null;
      if (!transaction.payment_received && transaction.stripe_payment_intent_id) {
        try {
          const { stripe } = require('../config/stripe');
          const paymentIntent = await stripe.paymentIntents.retrieve(transaction.stripe_payment_intent_id);
          clientSecret = paymentIntent.client_secret;
        } catch (error) {
          console.error('Error retrieving payment intent:', error);
          // Continue without client secret if there's an error
        }
      }

      res.json({
        ...transaction,
        client_secret: clientSecret
      });
    } catch (error) {
      console.error('Error fetching transaction:', error);
      res.status(500).json({ error: 'Failed to fetch transaction' });
    }
  }

  static async confirmPayment(req, res) {
    try {
      const { transactionId } = req.params;
      
      // Verify payment with Stripe before confirming
      const transaction = await TransactionService.confirmPaymentReceived(transactionId);
      
      // Emit payment confirmed
      emitTransactionUpdate(transactionId, { 
        type: 'payment_confirmed', 
        amount: transaction.amount 
      });

      // Check if transaction can be completed
      const checkedTransaction = await TransactionService.checkAndCompleteTransaction(transactionId);
      
      if (checkedTransaction.status === 'completed') {
        emitTransactionUpdate(transactionId, { 
          type: 'completed', 
          amount: checkedTransaction.amount 
        });
      }
      
      res.json({
        message: 'Payment confirmed successfully',
        transaction: checkedTransaction
      });
    } catch (error) {
      console.error('Error confirming payment:', error);
      
      // Provide more specific error messages
      if (error.message.includes('not been completed') || error.message.includes('verification failed')) {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(500).json({ 
        error: 'Failed to confirm payment',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async uploadFile(req, res) {
    try {
      const { transactionId } = req.params;
      const transaction = await TransactionService.getTransaction(transactionId);

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      const isSeller = req.user && transaction.seller_email === req.user.email;
      const isBuyer = req.user && transaction.buyer_email === req.user.email;
      if (!isSeller && !isBuyer) {
        return res.status(403).json({ error: 'Only the buyer or seller can upload files for this transaction' });
      }
      const fileType = isBuyer ? 'buyer' : 'seller';

      // Use memory upload
      uploadMemory.single('file')(req, res, async (err) => {
        if (err) {
          return res.status(err.statusCode || 400).json({ error: err.message || 'File upload failed' });
        }

        try {
          if (!req.file || !req.file.buffer) {
            return res.status(400).json({ error: 'No file provided' });
          }

          const validation = checkUploadedFile(req.file, { maxSize: MAX_FILE_SIZE_BYTES });
          if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
          }

          const { originalname, mimetype, size, buffer } = req.file;

          const { wrappedKey, iv, tag, ciphertext } = encryptBuffer(buffer);

          await TransactionFile.create({
            transactionId,
            filename: originalname,
            mime: mimetype,
            sizeBytes: size,
            encKey: wrappedKey,
            encIv: iv,
            encTag: tag,
            encBlob: ciphertext,
            fileType,
          });

          if (fileType === 'buyer') {
            await Transaction.updateBuyerFileStatus(transactionId, originalname);
            const updated = await TransactionService.getTransaction(transactionId);
            res.json({ message: 'Requirements file uploaded successfully', transaction: updated });
            return;
          }

          await Transaction.updateFileStatus(transactionId, 'n/a', originalname);
          emitTransactionUpdate(transactionId, { type: 'file_uploaded', fileName: originalname });
          await NotificationService.notifyFileUploaded(
            transactionId,
            transaction.buyer_email,
            transaction.seller_email,
            originalname
          );
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
      const wantBuyerFile = req.query.file === 'buyer';
      const transaction = await TransactionService.getTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      if (!req.user || (req.user.email !== transaction.buyer_email && req.user.email !== transaction.seller_email)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const fileType = wantBuyerFile ? 'buyer' : 'seller';
      if (wantBuyerFile && req.user.email !== transaction.seller_email) {
        return res.status(403).json({ error: 'Only the seller can download the buyer\'s requirements file' });
      }
      if (!wantBuyerFile && req.user.email !== transaction.buyer_email) {
        return res.status(403).json({ error: 'Only the buyer can download the deliverable file' });
      }

      const meta = await TransactionFile.findLatestMetadataByTransactionId(transactionId, fileType);
      if (!meta) {
        return res.status(404).json({ error: 'File not found' });
      }

      const parts = await TransactionFile.getEncryptedParts(meta.id);
      if (!parts) {
        return res.status(404).json({ error: 'File data not found' });
      }

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

  // New endpoint: Get buyer transactions and statistics (optional: ?search= &status=)
  static async getBuyerData(req, res) {
    try {
      if (!req.user || !req.user.email) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userEmail = req.user.email;
      const search = (req.query.search && String(req.query.search).trim()) || undefined;
      const status = (req.query.status && String(req.query.status).trim()) || undefined;
      const [transactions, stats] = await Promise.all([
        Transaction.findByBuyerEmail(userEmail, { search, status }),
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

  // New endpoint: Get seller transactions and statistics (optional: ?search= &status=)
  static async getSellerData(req, res) {
    try {
      if (!req.user || !req.user.email) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userEmail = req.user.email;
      const search = (req.query.search && String(req.query.search).trim()) || undefined;
      const status = (req.query.status && String(req.query.status).trim()) || undefined;
      const [transactions, stats] = await Promise.all([
        Transaction.findBySellerEmail(userEmail, { search, status }),
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

      // In-app notifications for both parties
      await NotificationService.notifyTransactionCancelled(
        transactionId,
        transaction.buyer_email,
        transaction.seller_email
      );

      res.json({
        message: 'Transaction cancelled successfully',
        transaction: updatedTransaction
      });
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      res.status(500).json({ error: 'Failed to cancel transaction' });
    }
  }

  // Admin only: Refund a transaction
  static async refundTransaction(req, res) {
    try {
      const { transactionId } = req.params;
      const { reason, amount: refundAmount } = req.body || {};

      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      if (!transaction.stripe_payment_intent_id) {
        return res.status(400).json({ error: 'No payment intent found for this transaction' });
      }

      if (!transaction.payment_received) {
        return res.status(400).json({ error: 'Payment was not received; nothing to refund' });
      }

      if (transaction.status === 'refunded') {
        return res.status(400).json({ error: 'Transaction already refunded' });
      }

      const { createRefund } = require('../config/stripe');
      await createRefund(transaction.stripe_payment_intent_id, {
        reason: reason || 'requested_by_customer',
        amount: refundAmount ? parseFloat(refundAmount) : undefined,
      });

      const updatedTransaction = await Transaction.updateStatus(transactionId, 'refunded');

      emitTransactionUpdate(transactionId, { type: 'refunded' });

      res.json({
        message: 'Refund processed successfully',
        transaction: updatedTransaction,
      });
    } catch (error) {
      console.error('Error processing refund:', error);
      const message = error.message || 'Failed to process refund';
      res.status(400).json({ error: message });
    }
  }

  // Process payment - verify with Stripe before marking as received
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

      // Verify payment with Stripe if payment intent exists
      if (transaction.stripe_payment_intent_id) {
        const { confirmPaymentIntent } = require('../config/stripe');
        const paymentSucceeded = await confirmPaymentIntent(transaction.stripe_payment_intent_id);
        
        if (!paymentSucceeded) {
          return res.status(400).json({ 
            error: 'Payment has not been completed. Please complete the payment in Stripe first.' 
          });
        }
      }

      // Use TransactionService to properly confirm payment
      const updatedTransaction = await TransactionService.confirmPaymentReceived(transactionId);

      // Check if transaction can be completed
      const checkedTransaction = await TransactionService.checkAndCompleteTransaction(transactionId);

      // Emit payment processed
      emitTransactionUpdate(transactionId, { 
        type: 'payment_processed', 
        amount: updatedTransaction.amount 
      });

      if (checkedTransaction.status === 'completed') {
        emitTransactionUpdate(transactionId, { 
          type: 'completed', 
          amount: checkedTransaction.amount 
        });
      }

      res.json({
        message: 'Payment processed successfully',
        transaction: checkedTransaction
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      
      // Provide more specific error messages
      if (error.message.includes('not been completed')) {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(500).json({ 
        error: 'Failed to process payment',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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