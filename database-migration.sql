-- Database Migration Script for Yappy Payment API
-- Execute this script in Supabase SQL Editor or any PostgreSQL client

-- Create PaymentStatus enum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED');

-- Add updated_at column
ALTER TABLE payments ADD COLUMN updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create function to update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Update status column to use enum (backup existing data first if needed)
ALTER TABLE payments ALTER COLUMN status TYPE "PaymentStatus" USING status::"PaymentStatus";
ALTER TABLE payments ALTER COLUMN status SET DEFAULT 'PENDING';

-- Set default value for currency
ALTER TABLE payments ALTER COLUMN currency SET DEFAULT 'USD';

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_uuid ON payments(uuid);

-- Add REVERSED status to enum
ALTER TYPE "PaymentStatus" ADD VALUE 'REVERSED';

-- Create yappy_sessions table
CREATE TABLE yappy_sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    token TEXT UNIQUE NOT NULL,
    code TEXT NOT NULL,
    state TEXT DEFAULT 'OPEN',
    open_at TIMESTAMP(3) NOT NULL,
    closed_at TIMESTAMP(3),
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for yappy_sessions
CREATE INDEX IF NOT EXISTS idx_yappy_sessions_token ON yappy_sessions(token);
CREATE INDEX IF NOT EXISTS idx_yappy_sessions_state ON yappy_sessions(state);

-- Create trigger for updated_at on yappy_sessions
CREATE TRIGGER update_yappy_sessions_updated_at 
    BEFORE UPDATE ON yappy_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();