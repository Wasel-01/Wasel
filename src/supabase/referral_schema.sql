-- Referral & Incentives Program Schema
-- Growth Metrics: CPA, LTV, Supply/Demand Balance

-- ============================================================================
-- REFERRAL TABLES
-- ============================================================================

-- Referral Codes
CREATE TABLE referral_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  uses_count INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT NULL, -- NULL = unlimited
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_code CHECK (code ~ '^[A-Z0-9]{6,12}$')
);

-- Referrals
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  completed_at TIMESTAMPTZ,
  
  -- Rewards
  referrer_reward_amount DECIMAL(10,2) DEFAULT 0,
  referred_reward_amount DECIMAL(10,2) DEFAULT 0,
  referrer_reward_paid BOOLEAN DEFAULT FALSE,
  referred_reward_paid BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(referred_id),
  CONSTRAINT no_self_referral CHECK (referrer_id != referred_id)
);

-- Incentive Campaigns
CREATE TABLE incentive_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('referral', 'first_ride', 'milestone', 'seasonal', 'surge')),
  
  -- Target audience
  target_user_type TEXT CHECK (target_user_type IN ('driver', 'rider', 'both')),
  target_new_users BOOLEAN DEFAULT FALSE,
  
  -- Reward structure
  reward_type TEXT NOT NULL CHECK (reward_type IN ('fixed', 'percentage', 'tiered')),
  reward_amount DECIMAL(10,2),
  reward_percentage DECIMAL(5,2),
  reward_tiers JSONB, -- [{min: 0, max: 5, amount: 10}, {min: 6, max: 10, amount: 20}]
  
  -- Conditions
  min_trip_value DECIMAL(10,2),
  min_trips_count INTEGER,
  valid_routes JSONB, -- [{from: 'Dubai', to: 'Abu Dhabi'}]
  
  -- Budget & limits
  total_budget DECIMAL(10,2),
  spent_amount DECIMAL(10,2) DEFAULT 0,
  max_rewards_per_user INTEGER,
  
  -- Timing
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Rewards
CREATE TABLE user_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES incentive_campaigns(id) ON DELETE SET NULL,
  referral_id UUID REFERENCES referrals(id) ON DELETE SET NULL,
  
  -- Reward details
  reward_type TEXT NOT NULL CHECK (reward_type IN ('cash', 'credit', 'discount', 'free_ride')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ,
  
  -- Payment
  paid_at TIMESTAMPTZ,
  transaction_id UUID REFERENCES transactions(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- GROWTH METRICS TABLES
-- ============================================================================

-- User Acquisition Metrics
CREATE TABLE user_acquisition_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Acquisition details
  acquisition_channel TEXT NOT NULL CHECK (acquisition_channel IN ('organic', 'referral', 'paid_ads', 'social', 'seo', 'partnership')),
  acquisition_source TEXT, -- Specific campaign, referrer, etc.
  acquisition_cost DECIMAL(10,2) DEFAULT 0, -- CPA
  
  -- User type
  user_type TEXT NOT NULL CHECK (user_type IN ('driver', 'rider')),
  
  -- Conversion tracking
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  first_trip_at TIMESTAMPTZ,
  days_to_first_trip INTEGER,
  
  -- Engagement
  total_trips INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  total_earned DECIMAL(10,2) DEFAULT 0,
  
  -- Retention
  is_active BOOLEAN DEFAULT TRUE,
  last_trip_at TIMESTAMPTZ,
  churned_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Lifetime Value Tracking
CREATE TABLE user_ltv_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- LTV components
  total_revenue DECIMAL(10,2) DEFAULT 0, -- Total value generated
  total_trips INTEGER DEFAULT 0,
  avg_trip_value DECIMAL(10,2) DEFAULT 0,
  
  -- Time-based metrics
  days_active INTEGER DEFAULT 0,
  months_active INTEGER DEFAULT 0,
  
  -- Predicted LTV
  predicted_ltv_30d DECIMAL(10,2),
  predicted_ltv_90d DECIMAL(10,2),
  predicted_ltv_365d DECIMAL(10,2),
  
  -- Cohort
  cohort_month TEXT, -- 'YYYY-MM'
  
  UNIQUE(user_id, calculated_at)
);

-- Supply/Demand Balance Metrics
CREATE TABLE supply_demand_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Time period
  metric_date DATE NOT NULL,
  metric_hour INTEGER CHECK (metric_hour >= 0 AND metric_hour <= 23),
  
  -- Geographic area
  city TEXT NOT NULL,
  area TEXT,
  
  -- Supply (drivers)
  active_drivers INTEGER DEFAULT 0,
  available_drivers INTEGER DEFAULT 0,
  total_trips_offered INTEGER DEFAULT 0,
  total_seats_offered INTEGER DEFAULT 0,
  
  -- Demand (riders)
  active_riders INTEGER DEFAULT 0,
  total_bookings_requested INTEGER DEFAULT 0,
  total_seats_requested INTEGER DEFAULT 0,
  
  -- Balance metrics
  supply_demand_ratio DECIMAL(5,2), -- seats_offered / seats_requested
  fulfillment_rate DECIMAL(5,2), -- accepted_bookings / total_bookings
  avg_wait_time_minutes INTEGER,
  
  -- Pricing impact
  avg_price_per_seat DECIMAL(10,2),
  surge_multiplier DECIMAL(3,2) DEFAULT 1.0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(metric_date, metric_hour, city, area)
);

-- Daily Growth Metrics Summary
CREATE TABLE daily_growth_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_date DATE NOT NULL UNIQUE,
  
  -- User acquisition
  new_users_total INTEGER DEFAULT 0,
  new_drivers INTEGER DEFAULT 0,
  new_riders INTEGER DEFAULT 0,
  
  -- Acquisition by channel
  organic_signups INTEGER DEFAULT 0,
  referral_signups INTEGER DEFAULT 0,
  paid_signups INTEGER DEFAULT 0,
  
  -- Costs
  total_acquisition_cost DECIMAL(10,2) DEFAULT 0,
  avg_cpa DECIMAL(10,2) DEFAULT 0,
  
  -- Engagement
  active_users INTEGER DEFAULT 0,
  active_drivers INTEGER DEFAULT 0,
  active_riders INTEGER DEFAULT 0,
  
  -- Revenue
  total_revenue DECIMAL(10,2) DEFAULT 0,
  avg_ltv DECIMAL(10,2) DEFAULT 0,
  
  -- Supply/Demand
  avg_supply_demand_ratio DECIMAL(5,2),
  avg_fulfillment_rate DECIMAL(5,2),
  
  -- Referrals
  referrals_completed INTEGER DEFAULT 0,
  referral_rewards_paid DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_referral_codes_user ON referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON referral_codes(code) WHERE is_active = TRUE;
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_id);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_user_rewards_user ON user_rewards(user_id, created_at DESC);
CREATE INDEX idx_user_rewards_status ON user_rewards(status) WHERE status = 'pending';
CREATE INDEX idx_campaigns_active ON incentive_campaigns(is_active, starts_at, ends_at);
CREATE INDEX idx_acquisition_channel ON user_acquisition_metrics(acquisition_channel);
CREATE INDEX idx_acquisition_date ON user_acquisition_metrics(registered_at);
CREATE INDEX idx_ltv_cohort ON user_ltv_metrics(cohort_month);
CREATE INDEX idx_supply_demand_date ON supply_demand_metrics(metric_date, metric_hour);
CREATE INDEX idx_supply_demand_city ON supply_demand_metrics(city, metric_date);
CREATE INDEX idx_daily_metrics_date ON daily_growth_metrics(metric_date DESC);

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Auto-generate referral code on user signup
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  INSERT INTO referral_codes (user_id, code)
  VALUES (NEW.id, new_code);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_referral_code_on_signup
AFTER INSERT ON profiles
FOR EACH ROW EXECUTE FUNCTION generate_referral_code();

-- Track user acquisition metrics
CREATE OR REPLACE FUNCTION track_user_acquisition()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_acquisition_metrics (
    user_id,
    acquisition_channel,
    user_type,
    registered_at
  ) VALUES (
    NEW.id,
    'organic', -- Default, update via application logic
    'rider', -- Default, update based on first action
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_acquisition_on_signup
AFTER INSERT ON profiles
FOR EACH ROW EXECUTE FUNCTION track_user_acquisition();

-- Update referral status on first trip
CREATE OR REPLACE FUNCTION complete_referral_on_first_trip()
RETURNS TRIGGER AS $$
DECLARE
  ref_record RECORD;
BEGIN
  IF NEW.status = 'completed' THEN
    -- Check if this is user's first completed trip
    IF (SELECT COUNT(*) FROM bookings WHERE passenger_id = NEW.passenger_id AND status = 'completed') = 1 THEN
      -- Complete referral if exists
      UPDATE referrals
      SET status = 'completed',
          completed_at = NOW()
      WHERE referred_id = NEW.passenger_id
        AND status = 'pending'
      RETURNING * INTO ref_record;
      
      -- Create rewards
      IF FOUND THEN
        -- Reward for referrer
        INSERT INTO user_rewards (user_id, referral_id, reward_type, amount, description)
        VALUES (ref_record.referrer_id, ref_record.id, 'credit', ref_record.referrer_reward_amount, 'Referral reward');
        
        -- Reward for referred
        INSERT INTO user_rewards (user_id, referral_id, reward_type, amount, description)
        VALUES (ref_record.referred_id, ref_record.id, 'credit', ref_record.referred_reward_amount, 'Welcome reward');
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_referral_completion
AFTER UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION complete_referral_on_first_trip();

-- Calculate supply/demand metrics
CREATE OR REPLACE FUNCTION calculate_supply_demand_metrics(
  target_date DATE DEFAULT CURRENT_DATE,
  target_hour INTEGER DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  hour_val INTEGER;
BEGIN
  FOR hour_val IN 0..23 LOOP
    IF target_hour IS NOT NULL AND hour_val != target_hour THEN
      CONTINUE;
    END IF;
    
    INSERT INTO supply_demand_metrics (
      metric_date, metric_hour, city,
      active_drivers, total_trips_offered, total_seats_offered,
      active_riders, total_bookings_requested, total_seats_requested,
      supply_demand_ratio, fulfillment_rate, avg_price_per_seat
    )
    SELECT
      target_date,
      hour_val,
      COALESCE(p.city, 'Unknown'),
      COUNT(DISTINCT t.driver_id),
      COUNT(DISTINCT t.id),
      SUM(t.available_seats),
      COUNT(DISTINCT b.passenger_id),
      COUNT(b.id),
      SUM(b.seats_requested),
      CASE WHEN SUM(b.seats_requested) > 0 
        THEN (SUM(t.available_seats)::DECIMAL / SUM(b.seats_requested))
        ELSE 0 END,
      CASE WHEN COUNT(b.id) > 0
        THEN (COUNT(CASE WHEN b.status = 'accepted' THEN 1 END)::DECIMAL / COUNT(b.id) * 100)
        ELSE 0 END,
      AVG(t.price_per_seat)
    FROM trips t
    LEFT JOIN bookings b ON t.id = b.trip_id
    LEFT JOIN profiles p ON t.driver_id = p.id
    WHERE t.departure_date = target_date
      AND EXTRACT(HOUR FROM t.departure_time) = hour_val
    GROUP BY p.city
    ON CONFLICT (metric_date, metric_hour, city, area) 
    DO UPDATE SET
      active_drivers = EXCLUDED.active_drivers,
      total_trips_offered = EXCLUDED.total_trips_offered,
      total_seats_offered = EXCLUDED.total_seats_offered,
      active_riders = EXCLUDED.active_riders,
      total_bookings_requested = EXCLUDED.total_bookings_requested,
      total_seats_requested = EXCLUDED.total_seats_requested,
      supply_demand_ratio = EXCLUDED.supply_demand_ratio,
      fulfillment_rate = EXCLUDED.fulfillment_rate,
      avg_price_per_seat = EXCLUDED.avg_price_per_seat;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Calculate daily growth metrics
CREATE OR REPLACE FUNCTION calculate_daily_growth_metrics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS void AS $$
BEGIN
  INSERT INTO daily_growth_metrics (
    metric_date,
    new_users_total, new_drivers, new_riders,
    organic_signups, referral_signups,
    total_acquisition_cost, avg_cpa,
    active_users, active_drivers, active_riders,
    total_revenue, avg_ltv,
    referrals_completed, referral_rewards_paid
  )
  SELECT
    target_date,
    COUNT(DISTINCT p.id),
    COUNT(DISTINCT CASE WHEN uam.user_type = 'driver' THEN p.id END),
    COUNT(DISTINCT CASE WHEN uam.user_type = 'rider' THEN p.id END),
    COUNT(DISTINCT CASE WHEN uam.acquisition_channel = 'organic' THEN p.id END),
    COUNT(DISTINCT CASE WHEN uam.acquisition_channel = 'referral' THEN p.id END),
    SUM(uam.acquisition_cost),
    AVG(uam.acquisition_cost),
    (SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE DATE(created_at) = target_date),
    (SELECT COUNT(DISTINCT driver_id) FROM trips WHERE DATE(created_at) = target_date),
    (SELECT COUNT(DISTINCT passenger_id) FROM bookings WHERE DATE(created_at) = target_date),
    (SELECT SUM(amount) FROM transactions WHERE DATE(created_at) = target_date AND payment_status = 'completed'),
    (SELECT AVG(total_revenue) FROM user_ltv_metrics WHERE DATE(calculated_at) = target_date),
    (SELECT COUNT(*) FROM referrals WHERE DATE(completed_at) = target_date),
    (SELECT SUM(amount) FROM user_rewards WHERE DATE(paid_at) = target_date AND referral_id IS NOT NULL)
  FROM profiles p
  LEFT JOIN user_acquisition_metrics uam ON p.id = uam.user_id
  WHERE DATE(p.created_at) = target_date
  ON CONFLICT (metric_date) DO UPDATE SET
    new_users_total = EXCLUDED.new_users_total,
    new_drivers = EXCLUDED.new_drivers,
    new_riders = EXCLUDED.new_riders,
    organic_signups = EXCLUDED.organic_signups,
    referral_signups = EXCLUDED.referral_signups,
    total_acquisition_cost = EXCLUDED.total_acquisition_cost,
    avg_cpa = EXCLUDED.avg_cpa,
    active_users = EXCLUDED.active_users,
    total_revenue = EXCLUDED.total_revenue,
    referrals_completed = EXCLUDED.referrals_completed;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE incentive_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_acquisition_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ltv_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE supply_demand_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_growth_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral codes" ON referral_codes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own referral codes" ON referral_codes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own referrals" ON referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "Campaigns viewable by all" ON incentive_campaigns FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Users can view own rewards" ON user_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Metrics viewable by all" ON supply_demand_metrics FOR SELECT USING (TRUE);
CREATE POLICY "Growth metrics viewable by all" ON daily_growth_metrics FOR SELECT USING (TRUE);
