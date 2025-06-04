const db = require('../config/db');

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
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  // Get all transactions for a user (by email)
  async findByUserEmail(email) {
    const query = `
      SELECT * FROM transactions
      WHERE buyer_email = $1 OR seller_email = $1
      ORDER BY created_at DESC
    `;
    const { rows } = await db.query(query, [email]);
    return rows;
  },

  // Get a single transaction by ID
  async findById(transactionId) {
    const query = 'SELECT * FROM transactions WHERE id = $1';
    const { rows } = await db.query(query, [transactionId]);
    return rows[0];
  }
};

module.exports = Transaction;