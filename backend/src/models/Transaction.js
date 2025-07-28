const { pool } = require('../config/db');

// Transaction Model
const Transaction = {
  // Create a new transaction
  async create({ buyerEmail, sellerEmail, amount, itemDescription, status = 'pending' }) {
    const query = `
      INSERT INTO transactions (buyer_email, seller_email, amount, item_description, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [buyerEmail, sellerEmail, amount, itemDescription, status];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // Get all transactions for a user (by email)
  async findByUserEmail(email) {
    const query = `
      SELECT * FROM transactions
      WHERE buyer_email = $1 OR seller_email = $1
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, [email]);
    return rows;
  },

  // Get transactions where user is buyer
  async findByBuyerEmail(email) {
    const query = `
      SELECT * FROM transactions
      WHERE buyer_email = $1
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, [email]);
    return rows;
  },

  // Get transactions where user is seller
  async findBySellerEmail(email) {
    const query = `
      SELECT * FROM transactions
      WHERE seller_email = $1
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, [email]);
    return rows;
  },

  // Get buyer statistics
  async getBuyerStats(email) {
    const query = `
      SELECT 
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN payment_received = true AND file_uploaded = false THEN 1 END) as pending_files,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_transactions,
        COALESCE(SUM(CASE WHEN payment_received = true THEN amount ELSE 0 END), 0) as total_spent
      FROM transactions
      WHERE buyer_email = $1
    `;
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  },

  // Get seller statistics
  async getSellerStats(email) {
    const query = `
      SELECT 
        COUNT(CASE WHEN file_uploaded = true THEN 1 END) as total_uploads,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_earned,
        COALESCE(SUM(CASE WHEN file_uploaded = true AND status != 'completed' THEN amount ELSE 0 END), 0) as pending_payouts,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as downloads_completed
      FROM transactions
      WHERE seller_email = $1
    `;
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  },

  // Get a single transaction by ID
  async findById(transactionId) {
    const query = 'SELECT * FROM transactions WHERE id = $1';
    const { rows } = await pool.query(query, [transactionId]);
    return rows[0];
  },

  // Update transaction status
  async updateStatus(transactionId, status) {
    const query = `
      UPDATE transactions 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [status, transactionId]);
    return rows[0];
  },

  // Update payment status
  async updatePaymentStatus(transactionId, paymentReceived = true) {
    const query = `
      UPDATE transactions 
      SET payment_received = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [paymentReceived, transactionId]);
    return rows[0];
  },

  // Update file upload status
  async updateFileStatus(transactionId, fileKey, fileName) {
    const query = `
      UPDATE transactions 
      SET file_uploaded = true, file_key = $1, file_name = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const { rows } = await pool.query(query, [fileKey, fileName, transactionId]);
    return rows[0];
  },

  // Check if user has permission to access transaction
  async hasAccess(transactionId, userEmail) {
    const query = `
      SELECT COUNT(*) as count FROM transactions
      WHERE id = $1 AND (buyer_email = $2 OR seller_email = $2)
    `;
    const { rows } = await pool.query(query, [transactionId, userEmail]);
    return parseInt(rows[0].count) > 0;
  }
};

module.exports = Transaction;