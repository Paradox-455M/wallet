const { query } = require('../config/db');

const createTables = async () => {
  try {
    // Create extension for UUID generation
    await query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        full_name VARCHAR(255),
        google_id VARCHAR(255) UNIQUE,
        google_display_name VARCHAR(255),
        google_avatar_url TEXT,
        github_id VARCHAR(255) UNIQUE,
        github_display_name VARCHAR(255),
        github_avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create transactions table
    await query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        buyer_email VARCHAR(255) NOT NULL,
        seller_email VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        item_description TEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        stripe_payment_intent_id VARCHAR(255),
        stripe_transfer_id VARCHAR(255),
        file_key VARCHAR(255),
        file_name VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        payment_received BOOLEAN DEFAULT FALSE,
        file_uploaded BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP WITH TIME ZONE,
        expires_at TIMESTAMP WITH TIME ZONE
      )
    `);

    // Create indexes
    await query('CREATE INDEX IF NOT EXISTS idx_buyer_email ON transactions(buyer_email)');
    await query('CREATE INDEX IF NOT EXISTS idx_seller_email ON transactions(seller_email)');
    await query('CREATE INDEX IF NOT EXISTS idx_status ON transactions(status)');
    await query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await query('CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id)');

    // Create update trigger function
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // Create triggers
    await query(`
      DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
      CREATE TRIGGER update_transactions_updated_at
          BEFORE UPDATE ON transactions
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column()
    `);

    await query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
          BEFORE UPDATE ON users
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column()
    `);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating database tables:', error);
    throw error;
  }
};

module.exports = { createTables };