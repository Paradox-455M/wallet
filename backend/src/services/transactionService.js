const db = require('../config/db');
const { createPaymentIntent, transferToSeller, confirmPaymentIntent } = require('../config/stripe');
const EmailService = require('./emailService');
const NotificationService = require('./notificationService');
const Transaction = require('../models/Transaction');

class TransactionService {
  static async createTransaction(buyerEmail, sellerEmail, amount, itemDescription) {
    const query = `
      INSERT INTO transactions 
      (buyer_email, seller_email, amount, item_description, expires_at)
      VALUES ($1, $2, $3, $4, NOW() + INTERVAL '24 hours')
      RETURNING id;
    `;
    
    const values = [buyerEmail, sellerEmail, amount, itemDescription];
    const result = await db.query(query, values);
    const transactionId = result.rows[0].id;
    
    // Send notification emails
    await EmailService.sendTransactionCreated(buyerEmail, sellerEmail, transactionId, amount, itemDescription);
    // In-app notifications
    await NotificationService.notifyTransactionCreated(transactionId, buyerEmail, sellerEmail, amount, itemDescription);
    
    return transactionId;
  }

  static async initiatePayment(transactionId, amount) {
    const paymentIntent = await createPaymentIntent(amount, { transactionId: String(transactionId) });
    
    const query = `
      UPDATE transactions
      SET stripe_payment_intent_id = $1
      WHERE id = $2
      RETURNING *;
    `;
    
    await db.query(query, [paymentIntent.id, transactionId]);
    return paymentIntent.client_secret;
  }

  static async confirmPaymentReceived(transactionId) {
    // First get the transaction to check payment intent ID
    const transaction = await this.getTransaction(transactionId);
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // If payment intent exists, verify with Stripe
    if (transaction.stripe_payment_intent_id) {
      const paymentSucceeded = await confirmPaymentIntent(transaction.stripe_payment_intent_id);
      
      if (!paymentSucceeded) {
        throw new Error('Payment has not been completed in Stripe');
      }
    }

    // Only update if payment hasn't been received yet
    if (transaction.payment_received) {
      return transaction;
    }

    const query = `
      UPDATE transactions
      SET payment_received = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    
    const result = await db.query(query, [transactionId]);
    const updatedTransaction = result.rows[0];
    
    // Send notification email
    await EmailService.sendPaymentReceived(
      updatedTransaction.buyer_email, 
      updatedTransaction.seller_email, 
      transactionId, 
      updatedTransaction.amount
    );
    // In-app notifications
    await NotificationService.notifyPaymentReceived(
      transactionId,
      updatedTransaction.buyer_email,
      updatedTransaction.seller_email,
      updatedTransaction.amount
    );
    
    return updatedTransaction;
  }

  static async updateFileInfo(transactionId, fileKey, fileName) {
    return await Transaction.updateFileStatus(transactionId, fileKey, fileName);
  }

  static async getTransaction(transactionId) {
    const query = 'SELECT * FROM transactions WHERE id = $1';
    const result = await db.query(query, [transactionId]);
    return result.rows[0];
  }

  static async completeTransaction(transactionId) {
    const transaction = await this.getTransaction(transactionId);
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (!transaction.payment_received || !transaction.file_uploaded) {
      throw new Error('Cannot complete transaction - payment or file missing');
    }

    // Verify payment one more time before completing
    if (transaction.stripe_payment_intent_id) {
      const paymentSucceeded = await confirmPaymentIntent(transaction.stripe_payment_intent_id);
      if (!paymentSucceeded) {
        throw new Error('Payment verification failed - cannot complete transaction');
      }
    }

    // For MVP, we'll mark as completed without actual transfer
    // In production, you would transfer funds to seller here
    // Transfer funds to seller (commented out for MVP - requires Stripe Connect)
    // const transfer = await transferToSeller(
    //   transaction.amount,
    //   transaction.seller_email, // In production, this would be the Stripe account ID
    //   transactionId
    // );

    const query = `
      UPDATE transactions
      SET status = 'completed',
          completed_at = NOW(),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;

    const result = await db.query(query, [transactionId]);
    const completedTransaction = result.rows[0];
    
    // Send completion notification
    await EmailService.sendTransactionCompleted(
      completedTransaction.buyer_email,
      completedTransaction.seller_email,
      transactionId,
      completedTransaction.amount
    );
    // In-app notifications
    await NotificationService.notifyTransactionCompleted(
      transactionId,
      completedTransaction.buyer_email,
      completedTransaction.seller_email,
      completedTransaction.amount
    );
    
    return completedTransaction;
  }

  static async getDownloadUrl(transactionId) {
    throw new Error('Direct download URL is not supported. Use the download endpoint.');
  }

  static async checkAndCompleteTransaction(transactionId) {
    const transaction = await this.getTransaction(transactionId);
    
    if (transaction.payment_received && transaction.file_uploaded) {
      return this.completeTransaction(transactionId);
    }
    
    return transaction;
  }
}

module.exports = TransactionService;