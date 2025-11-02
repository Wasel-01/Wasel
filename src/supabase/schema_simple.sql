-- Wasel Database Schema - Simplified Version
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Health check table
CREATE TABLE IF NOT EXISTS health_check (
  id SERIAL PRIMARY KEY,
  status TEXT DEFAULT 'ok',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert health check record
INSERT INTO health_check (status) VALUES ('ok');

-- Create function for health check
CREATE OR REPLACE FUNCTION check_schema_health()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
