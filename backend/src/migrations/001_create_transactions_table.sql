CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  buyer_email VARCHAR(255) NOT NULL,
  seller_email VARCHAR(255) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  item_description TEXT,
  expires_at TIMESTAMP,
  stripe_payment_intent_id VARCHAR(255),
  payment_received BOOLEAN DEFAULT FALSE,
  file_key VARCHAR(512),
  file_name VARCHAR(255),
  file_uploaded BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'pending',
  stripe_transfer_id VARCHAR(255),
  completed_at TIMESTAMP
);