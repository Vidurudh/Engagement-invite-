-- Migration 001: Create Blessings Table for Ranjani & Vidurudh Engagement
CREATE TABLE IF NOT EXISTS blessings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for ordering by creation time
CREATE INDEX IF NOT EXISTS idx_blessings_created_at ON blessings(created_at DESC);
