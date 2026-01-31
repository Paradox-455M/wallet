const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

// Create users table if not exists
const createTableIfNotExists = async () => {
  const tableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255),
      full_name VARCHAR(255) NOT NULL,
      google_id VARCHAR(255) UNIQUE,
      github_id VARCHAR(255) UNIQUE,
      google_display_name VARCHAR(255),
      github_display_name VARCHAR(255),
      google_avatar_url VARCHAR(512),
      github_avatar_url VARCHAR(512),
      created_at TIMESTAMP DEFAULT NOW()
    )`;
  
  try {
    await query(tableQuery);
    console.log('Ensured users table exists');
  } catch (err) {
    console.error('Error creating users table:', err);
    throw err;
  }
};

const User = {
  async init() {
    await createTableIfNotExists();
  },
  async findByEmail(email) {
    await createTableIfNotExists();
    const text = 'SELECT * FROM users WHERE email = $1';
    const values = [email];
    try {
      const res = await query(text, values);
      return res.rows[0];
    } catch (err) {
      console.error('Error finding user by email:', err);
      throw err;
    }
  },

  async findById(id) {
    const text = 'SELECT * FROM users WHERE id = $1';
    const values = [id];
    try {
      const res = await query(text, values);
      return res.rows[0];
    } catch (err) {
      console.error('Error finding user by id:', err);
      throw err;
    }
  },

  async create(email, password, fullName) {
    await createTableIfNotExists();
    const hashedPassword = await bcrypt.hash(password, 10);
    const text = 'INSERT INTO users(email, password_hash, full_name) VALUES($1, $2, $3) RETURNING id, email, full_name, created_at';
    const values = [email, hashedPassword, fullName];
    try {
      const res = await query(text, values);
      return res.rows[0];
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  },

  async findOrCreateSocialUser(profile, provider) {
    const { id: providerId, displayName, emails, photos } = profile;
    const email = emails && emails.length > 0 ? emails[0].value : null;
    // In a real app, you might want to handle cases where email is not provided by the OAuth provider
    // or allow users to link social accounts to existing email/password accounts.

    let user;
    if (email) {
      user = await this.findByEmail(email);
    }

    if (user) {
      // User exists, potentially link the social account if not already linked
      // For simplicity, we'll assume if email matches, it's the same user.
      // You might want to add columns like google_id, github_id to the users table
      // and update them here.
      const checkProviderText = `SELECT * FROM users WHERE id = $1 AND ${provider}_id = $2`;
      const checkProviderValues = [user.id, providerId];
      const providerRes = await query(checkProviderText, checkProviderValues);
      if (providerRes.rows.length === 0) {
        const updateText = `UPDATE users SET ${provider}_id = $1, ${provider}_display_name = $2, ${provider}_avatar_url = $3 WHERE id = $4 RETURNING *`;
        const updateValues = [providerId, displayName, photos && photos.length > 0 ? photos[0].value : null, user.id];
        const updatedUser = await query(updateText, updateValues);
        return updatedUser.rows[0];
      }
      return user;
    } else {
      // User does not exist, create a new one with social provider info
      // Password can be null or a randomly generated strong password if your schema requires it
      const insertText = `INSERT INTO users(email, ${provider}_id, ${provider}_display_name, ${provider}_avatar_url, full_name) VALUES($1, $2, $3, $4, $5) RETURNING *`;
      const insertValues = [email, providerId, displayName, photos && photos.length > 0 ? photos[0].value : null, displayName];
      try {
        const res = await query(insertText, insertValues);
        return res.rows[0];
      } catch (err) {
        console.error(`Error creating user with ${provider}:`, err);
        // It's possible the email is null and the provider_id already exists from a previous attempt without email
        // Or a unique constraint violation on provider_id if email was different/null before
        const findByProviderIdText = `SELECT * FROM users WHERE ${provider}_id = $1`;
        const findByProviderIdValues = [providerId];
        const existingUser = await query(findByProviderIdText, findByProviderIdValues);
        if (existingUser.rows[0]) return existingUser.rows[0];
        throw err;
      }
    }
  },

  async comparePassword(candidatePassword, hashedPassword) {
    return bcrypt.compare(candidatePassword, hashedPassword);
  },

  async updateProfile(userId, updates) {
    await createTableIfNotExists();
    const setClauses = [];
    const values = [];
    let i = 1;
    if (updates.fullName !== undefined && updates.fullName !== null && String(updates.fullName).trim()) {
      setClauses.push(`full_name = $${i}`);
      values.push(String(updates.fullName).trim());
      i++;
    }
    if (setClauses.length === 0) {
      return this.findById(userId);
    }
    values.push(userId);
    const text = `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`;
    const res = await query(text, values);
    return res.rows[0];
  },
};

module.exports = User;