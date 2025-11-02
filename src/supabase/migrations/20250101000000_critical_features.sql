-- Critical Features Migration
-- Adds tables and functions for payment, tracking, disputes, and notifications

-- Trip locations table for real-time GPS tracking
CREATE TABLE IF NOT EXISTS trip_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  lat DECIMAL(10,8) NOT NULL,
  lng DECIMAL(11,8) NOT NULL,
  heading DECIMAL(5,2),
  speed DECIMAL(5,2),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id)
);

CREATE INDEX idx_trip_locations_trip ON trip_locations(trip_id);
CREATE INDEX idx_trip_locations_updated ON trip_locations(updated_at DESC);

-- Disputes table
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
  reported_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  against_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  dispute_type TEXT NOT NULL CHECK (dispute_type IN ('payment', 'behavior', 'safety', 'cancellation', 'other')),
  description TEXT NOT NULL,
  evidence_url TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  resolution TEXT,
  resolved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_disputes_reported_by ON disputes(reported_by, created_at DESC);
CREATE INDEX idx_disputes_status ON disputes(status);

-- Enable RLS
ALTER TABLE trip_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trip_locations
CREATE POLICY "Trip participants can view location"
  ON trip_locations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trips t
      WHERE t.id = trip_locations.trip_id
      AND (t.driver_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM bookings WHERE trip_id = t.id AND passenger_id = auth.uid()))
    )
  );

CREATE POLICY "Drivers can update trip location"
  ON trip_locations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM trips WHERE id = trip_locations.trip_id AND driver_id = auth.uid()
    )
  );

-- RLS Policies for disputes
CREATE POLICY "Users can view own disputes"
  ON disputes FOR SELECT
  USING (auth.uid() = reported_by OR auth.uid() = against_user_id);

CREATE POLICY "Users can create disputes"
  ON disputes FOR INSERT
  WITH CHECK (auth.uid() = reported_by);

-- Function to process wallet payment
CREATE OR REPLACE FUNCTION process_wallet_payment(
  p_from_user_id UUID,
  p_to_user_id UUID,
  p_amount DECIMAL,
  p_booking_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_from_balance DECIMAL;
BEGIN
  -- Check sender balance
  SELECT wallet_balance INTO v_from_balance
  FROM profiles WHERE id = p_from_user_id;
  
  IF v_from_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Create transaction
  INSERT INTO transactions (
    from_user_id, to_user_id, booking_id, amount,
    currency, payment_method, payment_status,
    description, completed_at
  ) VALUES (
    p_from_user_id, p_to_user_id, p_booking_id, p_amount,
    'AED', 'wallet', 'completed',
    'Trip payment', NOW()
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add user to read_by array
CREATE OR REPLACE FUNCTION add_user_to_read_by(
  message_id UUID,
  user_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE messages
  SET read_by = array_append(COALESCE(read_by, ARRAY[]::UUID[]), user_id)
  WHERE id = message_id
  AND NOT (user_id = ANY(COALESCE(read_by, ARRAY[]::UUID[])));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update disputes updated_at
CREATE TRIGGER set_disputes_updated_at 
  BEFORE UPDATE ON disputes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();

-- Add verification level calculation
CREATE OR REPLACE FUNCTION calculate_verification_level(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  v_level INTEGER := 0;
BEGIN
  -- Phone verified: +1
  IF EXISTS (SELECT 1 FROM verifications WHERE user_id = user_uuid AND verification_type = 'phone' AND status = 'approved') THEN
    v_level := v_level + 1;
  END IF;
  
  -- Email verified: +1
  IF EXISTS (SELECT 1 FROM verifications WHERE user_id = user_uuid AND verification_type = 'email' AND status = 'approved') THEN
    v_level := v_level + 1;
  END IF;
  
  -- National ID: +1
  IF EXISTS (SELECT 1 FROM verifications WHERE user_id = user_uuid AND verification_type = 'national_id' AND status = 'approved') THEN
    v_level := v_level + 1;
  END IF;
  
  -- Driver's license: +1
  IF EXISTS (SELECT 1 FROM verifications WHERE user_id = user_uuid AND verification_type = 'drivers_license' AND status = 'approved') THEN
    v_level := v_level + 1;
  END IF;
  
  -- Selfie: +1
  IF EXISTS (SELECT 1 FROM verifications WHERE user_id = user_uuid AND verification_type = 'selfie' AND status = 'approved') THEN
    v_level := v_level + 1;
  END IF;
  
  RETURN v_level;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update verification level when verification status changes
CREATE OR REPLACE FUNCTION update_verification_level()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET verification_level = calculate_verification_level(NEW.user_id),
      is_verified = (calculate_verification_level(NEW.user_id) >= 3)
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_verification_level
  AFTER INSERT OR UPDATE ON verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_verification_level();
