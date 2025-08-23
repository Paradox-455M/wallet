-- Database schema for digital escrow platform

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
);

CREATE INDEX idx_buyer_email ON transactions(buyer_email);
CREATE INDEX idx_seller_email ON transactions(seller_email);
CREATE INDEX idx_status ON transactions(status);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Users table for authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_github_id ON users(github_id);

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- New: Encrypted transaction file storage
CREATE TABLE IF NOT EXISTS transaction_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  enc_key BYTEA NOT NULL,
  enc_iv BYTEA NOT NULL,
  enc_tag BYTEA NOT NULL,
  enc_blob BYTEA NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transaction_files_tx_id ON transaction_files(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_files_created_at ON transaction_files(created_at DESC);