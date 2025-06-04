const db = require('../config/db');
const { createPaymentIntent, transferToSeller, confirmPaymentIntent } = require('../config/stripe');
const { getSignedUrl } = require('../config/s3');

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
    return result.rows[0].id;
  }

  static async initiatePayment(transactionId, amount) {
    const paymentIntent = await createPaymentIntent(amount, { transactionId });
    
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
    const query = `
      UPDATE transactions
      SET payment_received = true
      WHERE id = $1
      RETURNING *;
    `;
    
    const result = await db.query(query, [transactionId]);
    return result.rows[0];
  }

  static async updateFileInfo(transactionId, fileKey, fileName) {
    const query = `
      UPDATE transactions
      SET file_key = $1, file_name = $2, file_uploaded = true
      WHERE id = $3
      RETURNING *;
    `;
    
    const result = await db.query(query, [fileKey, fileName, transactionId]);
    return result.rows[0];
  }

  static async getTransaction(transactionId) {
    const query = 'SELECT * FROM transactions WHERE id = $1';
    const result = await db.query(query, [transactionId]);
    return result.rows[0];
  }

  static async completeTransaction(transactionId) {
    const transaction = await this.getTransaction(transactionId);
    
    if (!transaction.payment_received || !transaction.file_uploaded) {
      throw new Error('Cannot complete transaction - payment or file missing');
    }

    // Transfer funds to seller
    const transfer = await transferToSeller(
      transaction.amount,
      transaction.seller_email, // In production, this would be the Stripe account ID
      transactionId
    );

    const query = `
      UPDATE transactions
      SET status = 'completed',
          stripe_transfer_id = $1,
          completed_at = NOW()
      WHERE id = $2
      RETURNING *;
    `;

    const result = await db.query(query, [transfer.id, transactionId]);
    return result.rows[0];
  }

  static async getDownloadUrl(transactionId) {
    const transaction = await this.getTransaction(transactionId);
    
    if (!transaction.file_uploaded) {
      throw new Error('File not yet uploaded');
    }

    return getSignedUrl(transaction.file_key);
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