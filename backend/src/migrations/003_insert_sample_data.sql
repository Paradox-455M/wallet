-- Migration 003: Insert sample data for testing
-- This migration adds sample transactions and users for testing the dashboard

-- Insert sample users
INSERT INTO users (email, full_name, created_at) VALUES
('buyer@example.com', 'John Buyer', CURRENT_TIMESTAMP),
('seller@example.com', 'Jane Seller', CURRENT_TIMESTAMP),
('test@example.com', 'Test User', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Insert sample transactions
INSERT INTO transactions (
    buyer_email, 
    seller_email, 
    amount, 
    item_description, 
    status, 
    payment_received, 
    file_uploaded,
    created_at
) VALUES
-- Completed transaction
('buyer@example.com', 'seller@example.com', 150.00, 'Premium Design Template', 'completed', true, true, CURRENT_TIMESTAMP - INTERVAL '5 days'),

-- Payment received, waiting for file upload
('buyer@example.com', 'seller@example.com', 75.50, 'Logo Design Package', 'pending', true, false, CURRENT_TIMESTAMP - INTERVAL '2 days'),

-- Pending payment
('buyer@example.com', 'seller@example.com', 200.00, 'Website Development', 'pending', false, false, CURRENT_TIMESTAMP - INTERVAL '1 day'),

-- Another completed transaction
('test@example.com', 'seller@example.com', 99.99, 'Mobile App Design', 'completed', true, true, CURRENT_TIMESTAMP - INTERVAL '3 days'),

-- Seller's perspective - file uploaded, waiting for completion
('buyer@example.com', 'seller@example.com', 125.00, 'Brand Identity Package', 'pending', true, true, CURRENT_TIMESTAMP - INTERVAL '1 day'),

-- Cancelled transaction
('test@example.com', 'seller@example.com', 50.00, 'Simple Logo', 'cancelled', false, false, CURRENT_TIMESTAMP - INTERVAL '4 days')
ON CONFLICT DO NOTHING; 