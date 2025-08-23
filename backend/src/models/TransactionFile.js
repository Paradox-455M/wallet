const { pool } = require('../config/db');

const TransactionFile = {
  /**
   * Insert encrypted file row
   * @param {Object} params
   * @param {string} params.transactionId
   * @param {string} params.filename
   * @param {string} params.mime
   * @param {number} params.sizeBytes
   * @param {Buffer} params.encKey
   * @param {Buffer} params.encIv
   * @param {Buffer} params.encTag
   * @param {Buffer} params.encBlob
   */
  async create({ transactionId, filename, mime, sizeBytes, encKey, encIv, encTag, encBlob }) {
    const query = `
      INSERT INTO transaction_files
        (transaction_id, filename, mime, size_bytes, enc_key, enc_iv, enc_tag, enc_blob)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, transaction_id, filename, mime, size_bytes, created_at
    `;
    const values = [transactionId, filename, mime, sizeBytes, encKey, encIv, encTag, encBlob];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  /**
   * Get latest file metadata for a transaction (without blob)
   */
  async findLatestMetadataByTransactionId(transactionId) {
    const query = `
      SELECT id, transaction_id, filename, mime, size_bytes, created_at
      FROM transaction_files
      WHERE transaction_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [transactionId]);
    return rows[0] || null;
  },

  /**
   * Get encrypted components for a specific file id
   */
  async getEncryptedParts(fileId) {
    const query = `
      SELECT enc_key, enc_iv, enc_tag, enc_blob, mime, filename, size_bytes
      FROM transaction_files
      WHERE id = $1
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [fileId]);
    return rows[0] || null;
  }
};

module.exports = TransactionFile;