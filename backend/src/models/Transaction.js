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

  // Map display status to DB conditions (payment_received, file_uploaded, status)
  _statusCondition(status) {
    if (!status || status === 'ALL') return null;
    const s = String(status).toUpperCase().replace(/\s+/g, ' ');
    if (s === 'AWAITING PAYMENT') return { payment_received: false };
    if (s === 'AWAITING FILE') return { payment_received: true, file_uploaded: false };
    if (s === 'COMPLETE') return { status: 'completed' };
    if (s === 'CANCELLED') return { status: 'cancelled' };
    if (s === 'REFUNDED') return { status: 'refunded' };
    if (s === 'PENDING') return { status: 'pending' };
    return null;
  },

  // Get transactions where user is buyer (optional: search by id/description, filter by status)
  async findByBuyerEmail(email, opts = {}) {
    const conditions = ['buyer_email = $1'];
    const values = [email];
    let idx = 2;
    if (opts.search && String(opts.search).trim()) {
      conditions.push(`(id::text ILIKE $${idx} OR item_description ILIKE $${idx})`);
      values.push(`%${String(opts.search).trim()}%`);
      idx += 1;
    }
    const statusCond = this._statusCondition(opts.status);
    if (statusCond) {
      if (statusCond.payment_received !== undefined) { conditions.push(`payment_received = $${idx}`); values.push(statusCond.payment_received); idx += 1; }
      if (statusCond.file_uploaded !== undefined) { conditions.push(`file_uploaded = $${idx}`); values.push(statusCond.file_uploaded); idx += 1; }
      if (statusCond.status) { conditions.push(`status = $${idx}`); values.push(statusCond.status); idx += 1; }
    }
    const query = `
      SELECT * FROM transactions
      WHERE ${conditions.join(' AND ')}
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, values);
    return rows;
  },

  // Get transactions where user is seller (optional: search by id/description, filter by status)
  async findBySellerEmail(email, opts = {}) {
    const conditions = ['seller_email = $1'];
    const values = [email];
    let idx = 2;
    if (opts.search && String(opts.search).trim()) {
      conditions.push(`(id::text ILIKE $${idx} OR item_description ILIKE $${idx})`);
      values.push(`%${String(opts.search).trim()}%`);
      idx += 1;
    }
    const statusCond = this._statusCondition(opts.status);
    if (statusCond) {
      if (statusCond.payment_received !== undefined) { conditions.push(`payment_received = $${idx}`); values.push(statusCond.payment_received); idx += 1; }
      if (statusCond.file_uploaded !== undefined) { conditions.push(`file_uploaded = $${idx}`); values.push(statusCond.file_uploaded); idx += 1; }
      if (statusCond.status) { conditions.push(`status = $${idx}`); values.push(statusCond.status); idx += 1; }
    }
    const query = `
      SELECT * FROM transactions
      WHERE ${conditions.join(' AND ')}
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, values);
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

  // List all transactions (admin). Optional: limit, offset, status
  async findAll(opts = {}) {
    const limit = Math.min(Math.max(parseInt(opts.limit, 10) || 100, 1), 500);
    const offset = Math.max(parseInt(opts.offset, 10) || 0, 0);
    const conditions = [];
    const values = [];
    let idx = 1;
    if (opts.status && String(opts.status).trim()) {
      conditions.push(`status = $${idx}`);
      values.push(String(opts.status).trim().toLowerCase());
      idx += 1;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `
      SELECT * FROM transactions
      ${where}
      ORDER BY created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    values.push(limit, offset);
    const { rows } = await pool.query(query, values);
    return rows;
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

  // Update file upload status (seller deliverable)
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

  // Update buyer file upload status (buyer requirements/brief)
  async updateBuyerFileStatus(transactionId, fileName) {
    const query = `
      UPDATE transactions 
      SET buyer_file_uploaded = true, buyer_file_name = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [fileName, transactionId]);
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