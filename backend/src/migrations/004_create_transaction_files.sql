-- Create table to store encrypted files for transactions
CREATE TABLE IF NOT EXISTS transaction_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  enc_key BYTEA NOT NULL,           -- encrypted data key (KMS/envelope) using master key
  enc_iv BYTEA NOT NULL,            -- IV/nonce used for AES-256-GCM
  enc_tag BYTEA NOT NULL,           -- GCM authentication tag
  enc_blob BYTEA NOT NULL,          -- ciphertext bytes
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transaction_files_tx_id ON transaction_files(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_files_created_at ON transaction_files(created_at DESC);