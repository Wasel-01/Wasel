-- Innovation Features Migration
-- Carbon Gamification, Social Circles, MENA Cultural Features

-- Carbon Stats Table
CREATE TABLE IF NOT EXISTS carbon_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_co2_saved DECIMAL(10,2) DEFAULT 0,
  level INTEGER DEFAULT 1,
  rank INTEGER,
  badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_carbon_stats_user ON carbon_stats(user_id);
CREATE INDEX idx_carbon_stats_leaderboard ON carbon_stats(total_co2_saved DESC);

-- User Tokens Table (for gamification rewards)
CREATE TABLE IF NOT EXISTS user_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tokens INTEGER DEFAULT 0,
  reason TEXT,
  awarded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_tokens_user ON user_tokens(user_id);

-- Social Circles Table
CREATE TABLE IF NOT EXISTS social_circles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('commute', 'corporate', 'university', 'women_only', 'family', 'professional')),
  description TEXT,
  route_from TEXT NOT NULL,
  route_to TEXT NOT NULL,
  schedule TEXT[] DEFAULT '{}',
  is_private BOOLEAN DEFAULT FALSE,
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_social_circles_type ON social_circles(type);
CREATE INDEX idx_social_circles_route ON social_circles(route_from, route_to);
CREATE INDEX idx_social_circles_admin ON social_circles(admin_id);

-- Circle Members Table
CREATE TABLE IF NOT EXISTS circle_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID NOT NULL REFERENCES social_circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(circle_id, user_id)
);

CREATE INDEX idx_circle_members_circle ON circle_members(circle_id);
CREATE INDEX idx_circle_members_user ON circle_members(user_id);

-- Circle Messages Table
CREATE TABLE IF NOT EXISTS circle_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID NOT NULL REFERENCES social_circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_circle_messages_circle ON circle_messages(circle_id, created_at DESC);

-- User Cultural Preferences Table
CREATE TABLE IF NOT EXISTS user_cultural_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prayer_reminders BOOLEAN DEFAULT TRUE,
  ramadan_mode BOOLEAN DEFAULT FALSE,
  gender_preference TEXT DEFAULT 'any' CHECK (gender_preference IN ('any', 'male_only', 'female_only', 'family')),
  language_preference TEXT DEFAULT 'en' CHECK (language_preference IN ('en', 'ar', 'ur', 'hi')),
  halal_only BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_cultural_prefs_user ON user_cultural_preferences(user_id);

-- Add circle_id to trips table
ALTER TABLE trips ADD COLUMN IF NOT EXISTS circle_id UUID REFERENCES social_circles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_trips_circle ON trips(circle_id);

-- Add gender and family_friendly to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS driver_gender TEXT CHECK (driver_gender IN ('male', 'female', 'other'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS family_friendly BOOLEAN DEFAULT FALSE;

-- Enable RLS
ALTER TABLE carbon_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cultural_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for carbon_stats
CREATE POLICY "Users can view own carbon stats"
  ON carbon_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own carbon stats"
  ON carbon_stats FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view leaderboard"
  ON carbon_stats FOR SELECT
  USING (TRUE);

-- RLS Policies for social_circles
CREATE POLICY "Public circles viewable by all"
  ON social_circles FOR SELECT
  USING (is_private = FALSE OR admin_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM circle_members WHERE circle_id = social_circles.id AND user_id = auth.uid()));

CREATE POLICY "Users can create circles"
  ON social_circles FOR INSERT
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins can update circles"
  ON social_circles FOR UPDATE
  USING (auth.uid() = admin_id);

-- RLS Policies for circle_members
CREATE POLICY "Members can view circle membership"
  ON circle_members FOR SELECT
  USING (EXISTS (SELECT 1 FROM social_circles WHERE id = circle_members.circle_id AND 
                 (is_private = FALSE OR admin_id = auth.uid() OR 
                  EXISTS (SELECT 1 FROM circle_members cm WHERE cm.circle_id = circle_members.circle_id AND cm.user_id = auth.uid()))));

CREATE POLICY "Users can join circles"
  ON circle_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave circles"
  ON circle_members FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for circle_messages
CREATE POLICY "Circle members can view messages"
  ON circle_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM circle_members WHERE circle_id = circle_messages.circle_id AND user_id = auth.uid()));

CREATE POLICY "Circle members can post messages"
  ON circle_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id AND 
              EXISTS (SELECT 1 FROM circle_members WHERE circle_id = circle_messages.circle_id AND user_id = auth.uid()));

-- RLS Policies for user_cultural_preferences
CREATE POLICY "Users can manage own preferences"
  ON user_cultural_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Function to update circle member count
CREATE OR REPLACE FUNCTION update_circle_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE social_circles
  SET members = (SELECT COUNT(*) FROM circle_members WHERE circle_id = NEW.circle_id)
  WHERE id = NEW.circle_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_member_count_on_join
  AFTER INSERT ON circle_members
  FOR EACH ROW
  EXECUTE FUNCTION update_circle_member_count();

CREATE TRIGGER update_member_count_on_leave
  AFTER DELETE ON circle_members
  FOR EACH ROW
  EXECUTE FUNCTION update_circle_member_count();

-- Add members column to social_circles
ALTER TABLE social_circles ADD COLUMN IF NOT EXISTS members INTEGER DEFAULT 0;

-- Trigger to update carbon stats updated_at
CREATE TRIGGER set_carbon_stats_updated_at
  BEFORE UPDATE ON carbon_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_social_circles_updated_at
  BEFORE UPDATE ON social_circles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_cultural_prefs_updated_at
  BEFORE UPDATE ON user_cultural_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
