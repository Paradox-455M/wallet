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
   * @param {string} [params.fileType] - 'seller' (deliverable) or 'buyer' (requirements). Default 'seller'.
   */
  async create({ transactionId, filename, mime, sizeBytes, encKey, encIv, encTag, encBlob, fileType = 'seller' }) {
    const type = fileType === 'buyer' ? 'buyer' : 'seller';
    const query = `
      INSERT INTO transaction_files
        (transaction_id, filename, mime, size_bytes, enc_key, enc_iv, enc_tag, enc_blob, file_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, transaction_id, filename, mime, size_bytes, created_at, file_type
    `;
    const values = [transactionId, filename, mime, sizeBytes, encKey, encIv, encTag, encBlob, type];
    try {
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (e) {
      if ((e.code === '42703' || (e.message && e.message.includes('file_type'))) && type === 'seller') {
        const queryNoType = `
          INSERT INTO transaction_files
            (transaction_id, filename, mime, size_bytes, enc_key, enc_iv, enc_tag, enc_blob)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id, transaction_id, filename, mime, size_bytes, created_at
        `;
        const { rows } = await pool.query(queryNoType, [transactionId, filename, mime, sizeBytes, encKey, encIv, encTag, encBlob]);
        return rows[0];
      }
      throw e;
    }
  },

  /**
   * Get latest file metadata for a transaction (without blob). Optional fileType: 'seller' | 'buyer'.
   */
  async findLatestMetadataByTransactionId(transactionId, fileType = null) {
    if (fileType === 'buyer') {
      const query = `
        SELECT id, transaction_id, filename, mime, size_bytes, created_at
        FROM transaction_files
        WHERE transaction_id = $1 AND file_type = 'buyer'
        ORDER BY created_at DESC
        LIMIT 1
      `;
      try {
        const { rows } = await pool.query(query, [transactionId]);
        return rows[0] || null;
      } catch (e) {
        if (e.code === '42703') return null;
        throw e;
      }
    }
    if (fileType === 'seller') {
      const query = `
        SELECT id, transaction_id, filename, mime, size_bytes, created_at
        FROM transaction_files
        WHERE transaction_id = $1 AND (file_type = 'seller' OR file_type IS NULL)
        ORDER BY created_at DESC
        LIMIT 1
      `;
      try {
        const { rows } = await pool.query(query, [transactionId]);
        return rows[0] || null;
      } catch (e) {
        if (e.code === '42703') {
          const fallback = `
            SELECT id, transaction_id, filename, mime, size_bytes, created_at
            FROM transaction_files WHERE transaction_id = $1 ORDER BY created_at DESC LIMIT 1
          `;
          const { rows } = await pool.query(fallback, [transactionId]);
          return rows[0] || null;
        }
        throw e;
      }
    }
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