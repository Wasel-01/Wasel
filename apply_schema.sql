-- Health check table and function for backend validation
CREATE TABLE IF NOT EXISTS health_check (
  id SERIAL PRIMARY KEY,
  status TEXT DEFAULT 'healthy',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health check function
CREATE OR REPLACE FUNCTION check_schema_health()
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO health_check (status) VALUES ('healthy');
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Basic profiles table for authentication
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_check ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Health check policies
CREATE POLICY "Health check readable by all"
  ON health_check FOR SELECT
  USING (TRUE);

CREATE POLICY "Health check insertable by all"
  ON health_check FOR INSERT
  WITH CHECK (TRUE);