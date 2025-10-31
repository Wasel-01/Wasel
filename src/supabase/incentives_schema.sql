-- Incentive Campaigns Table
CREATE TABLE IF NOT EXISTS incentive_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) NOT NULL CHECK (campaign_type IN ('referral', 'first_ride', 'loyalty', 'seasonal')),
    target_audience VARCHAR(20) NOT NULL CHECK (target_audience IN ('drivers', 'riders', 'both')),
    reward_type VARCHAR(20) NOT NULL CHECK (reward_type IN ('cash', 'credit', 'discount', 'free_ride')),
    reward_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    referrer_reward DECIMAL(10,2),
    referred_reward DECIMAL(10,2),
    trigger_condition VARCHAR(255) NOT NULL,
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign Participants Table
CREATE TABLE IF NOT EXISTS campaign_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES incentive_campaigns(id) ON DELETE CASCADE,
    participated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reward_earned DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
    UNIQUE(user_id, campaign_id)
);

-- User Acquisition Metrics Table
CREATE TABLE IF NOT EXISTS user_acquisition_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    acquisition_channel VARCHAR(100),
    acquisition_cost DECIMAL(10,2) DEFAULT 0,
    referral_code VARCHAR(20),
    campaign_id UUID REFERENCES incentive_campaigns(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User LTV Metrics Table
CREATE TABLE IF NOT EXISTS user_ltv_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    total_revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_trips INTEGER NOT NULL DEFAULT 0,
    avg_trip_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    days_active INTEGER NOT NULL DEFAULT 0,
    months_active INTEGER NOT NULL DEFAULT 0,
    cohort_month VARCHAR(7), -- YYYY-MM format
    predicted_ltv_30d DECIMAL(10,2) DEFAULT 0,
    predicted_ltv_90d DECIMAL(10,2) DEFAULT 0,
    predicted_ltv_365d DECIMAL(10,2) DEFAULT 0,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Growth Metrics Table
CREATE TABLE IF NOT EXISTS daily_growth_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_date DATE NOT NULL,
    new_users_total INTEGER DEFAULT 0,
    new_drivers INTEGER DEFAULT 0,
    new_riders INTEGER DEFAULT 0,
    avg_cpa DECIMAL(10,2) DEFAULT 0,
    avg_ltv DECIMAL(10,2) DEFAULT 0,
    avg_supply_demand_ratio DECIMAL(5,2) DEFAULT 0,
    avg_fulfillment_rate DECIMAL(5,2) DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    total_trips INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(metric_date)
);

-- Supply Demand Metrics Table
CREATE TABLE IF NOT EXISTS supply_demand_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_date DATE NOT NULL,
    metric_hour INTEGER NOT NULL CHECK (metric_hour >= 0 AND metric_hour <= 23),
    city VARCHAR(100),
    active_drivers INTEGER DEFAULT 0,
    active_riders INTEGER DEFAULT 0,
    total_seats_offered INTEGER DEFAULT 0,
    total_seats_requested INTEGER DEFAULT 0,
    supply_demand_ratio DECIMAL(5,2) DEFAULT 0,
    fulfillment_rate DECIMAL(5,2) DEFAULT 0,
    avg_wait_time_minutes DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(metric_date, metric_hour, city)
);

-- Update user_rewards table to include campaign_id
ALTER TABLE user_rewards 
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES incentive_campaigns(id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_incentive_campaigns_active ON incentive_campaigns(is_active, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_user ON campaign_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_campaign ON campaign_participants(campaign_id);
CREATE INDEX IF NOT EXISTS idx_user_acquisition_channel ON user_acquisition_metrics(acquisition_channel);
CREATE INDEX IF NOT EXISTS idx_user_ltv_cohort ON user_ltv_metrics(cohort_month);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_growth_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_supply_demand_date_hour ON supply_demand_metrics(metric_date, metric_hour);

-- Function to calculate referral performance
CREATE OR REPLACE FUNCTION get_referral_performance(user_id UUID)
RETURNS TABLE (
    total_referrals INTEGER,
    successful_referrals INTEGER,
    total_earned DECIMAL(10,2),
    conversion_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_referrals,
        COUNT(CASE WHEN r.status = 'completed' THEN 1 END)::INTEGER as successful_referrals,
        COALESCE(SUM(CASE WHEN r.status = 'completed' THEN r.referrer_reward_amount ELSE 0 END), 0) as total_earned,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                (COUNT(CASE WHEN r.status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL * 100)
            ELSE 0 
        END as conversion_rate
    FROM referrals r
    WHERE r.referrer_id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update campaign participant count
CREATE OR REPLACE FUNCTION update_campaign_participants()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE incentive_campaigns 
        SET current_participants = current_participants + 1
        WHERE id = NEW.campaign_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE incentive_campaigns 
        SET current_participants = current_participants - 1
        WHERE id = OLD.campaign_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update participant counts
CREATE TRIGGER trigger_update_campaign_participants
    AFTER INSERT OR DELETE ON campaign_participants
    FOR EACH ROW EXECUTE FUNCTION update_campaign_participants();

-- Function to calculate daily growth metrics
CREATE OR REPLACE FUNCTION calculate_daily_growth_metrics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
    new_users_count INTEGER;
    new_drivers_count INTEGER;
    new_riders_count INTEGER;
    avg_cpa_value DECIMAL(10,2);
    avg_ltv_value DECIMAL(10,2);
    total_revenue_value DECIMAL(10,2);
    total_trips_count INTEGER;
BEGIN
    -- Count new users
    SELECT COUNT(*) INTO new_users_count
    FROM profiles 
    WHERE DATE(created_at) = target_date;
    
    -- Count new drivers and riders
    SELECT 
        COUNT(CASE WHEN user_type = 'driver' THEN 1 END),
        COUNT(CASE WHEN user_type = 'rider' THEN 1 END)
    INTO new_drivers_count, new_riders_count
    FROM profiles 
    WHERE DATE(created_at) = target_date;
    
    -- Calculate average CPA
    SELECT COALESCE(AVG(acquisition_cost), 0) INTO avg_cpa_value
    FROM user_acquisition_metrics
    WHERE DATE(created_at) = target_date;
    
    -- Calculate average LTV
    SELECT COALESCE(AVG(total_revenue), 0) INTO avg_ltv_value
    FROM user_ltv_metrics
    WHERE DATE(calculated_at) = target_date;
    
    -- Calculate total revenue and trips
    SELECT 
        COALESCE(SUM(total_amount), 0),
        COUNT(*)
    INTO total_revenue_value, total_trips_count
    FROM bookings
    WHERE DATE(created_at) = target_date AND status = 'completed';
    
    -- Insert or update daily metrics
    INSERT INTO daily_growth_metrics (
        metric_date, new_users_total, new_drivers, new_riders,
        avg_cpa, avg_ltv, total_revenue, total_trips
    ) VALUES (
        target_date, new_users_count, new_drivers_count, new_riders_count,
        avg_cpa_value, avg_ltv_value, total_revenue_value, total_trips_count
    )
    ON CONFLICT (metric_date) DO UPDATE SET
        new_users_total = EXCLUDED.new_users_total,
        new_drivers = EXCLUDED.new_drivers,
        new_riders = EXCLUDED.new_riders,
        avg_cpa = EXCLUDED.avg_cpa,
        avg_ltv = EXCLUDED.avg_ltv,
        total_revenue = EXCLUDED.total_revenue,
        total_trips = EXCLUDED.total_trips;
END;
$$ LANGUAGE plpgsql;