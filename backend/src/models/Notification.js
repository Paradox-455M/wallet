const { pool } = require('../config/db');

const Notification = {
  async create({ userEmail, transactionId, type, title, message }) {
    const query = `
      INSERT INTO notifications (user_email, transaction_id, type, title, message)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [userEmail, transactionId || null, type, title, message || null];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async findByUserEmail(userEmail, options = {}) {
    const { limit = 50, unreadOnly = false } = options;
    let query = `
      SELECT n.*, t.item_description, t.amount
      FROM notifications n
      LEFT JOIN transactions t ON n.transaction_id = t.id
      WHERE n.user_email = $1
    `;
    const params = [userEmail];
    if (unreadOnly) {
      query += ' AND n.read_at IS NULL';
    }
    query += ' ORDER BY n.created_at DESC LIMIT $2';
    params.push(limit);
    const { rows } = await pool.query(query, params);
    return rows;
  },

  async getUnreadCount(userEmail) {
    const query = `
      SELECT COUNT(*) as count FROM notifications
      WHERE user_email = $1 AND read_at IS NULL
    `;
    const { rows } = await pool.query(query, [userEmail]);
    return parseInt(rows[0].count, 10);
  },

  async markAsRead(notificationId, userEmail) {
    const query = `
      UPDATE notifications
      SET read_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_email = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [notificationId, userEmail]);
    return rows[0];
  },

  async markAllAsRead(userEmail) {
    const query = `
      UPDATE notifications
      SET read_at = CURRENT_TIMESTAMP
      WHERE user_email = $1 AND read_at IS NULL
      RETURNING id
    `;
    const { rows } = await pool.query(query, [userEmail]);
    return rows.length;
  },
};

module.exports = Notification;
