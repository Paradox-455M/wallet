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
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_admin') THEN
          ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
        END IF;
      END $$
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

    // Create notifications table
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_email VARCHAR(255) NOT NULL,
        transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        read_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await query('CREATE INDEX IF NOT EXISTS idx_buyer_email ON transactions(buyer_email)');
    await query('CREATE INDEX IF NOT EXISTS idx_seller_email ON transactions(seller_email)');
    await query('CREATE INDEX IF NOT EXISTS idx_status ON transactions(status)');
    await query('CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_email)');
    await query('CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read_at)');
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

    // Buyer file support: buyer can upload a requirements/brief file for the seller
    await query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'buyer_file_uploaded') THEN
          ALTER TABLE transactions ADD COLUMN buyer_file_uploaded BOOLEAN DEFAULT FALSE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'buyer_file_name') THEN
          ALTER TABLE transactions ADD COLUMN buyer_file_name VARCHAR(255);
        END IF;
      END $$
    `);

    // transaction_files.file_type: 'seller' (deliverable) or 'buyer' (requirements)
    await query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transaction_files')
           AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'transaction_files' AND column_name = 'file_type') THEN
          ALTER TABLE transaction_files ADD COLUMN file_type VARCHAR(20) DEFAULT 'seller';
        END IF;
      END $$
    `);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating database tables:', error);
    throw error;
  }
};

module.exports = { createTables };