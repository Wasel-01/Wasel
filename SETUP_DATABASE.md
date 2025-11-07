# 🗄️ Database Setup Guide

## Issue: Missing Database Tables

Your Wasel application is connected to Supabase, but the database tables haven't been created yet.

## ✅ Quick Fix (Recommended)

### Option 1: Using Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Login to your account

2. **Select Your Project**
   - Project: `djccmatubyyudeosrngm`

3. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

4. **Copy and Run Schema**
   - Open file: `src/supabase/schema.sql`
   - Copy ALL the content
   - Paste into SQL Editor
   - Click "Run" button

5. **Verify Tables Created**
   ```bash
   node apply-schema-simple.js
   ```

### Option 2: Using Supabase CLI

1. **Initialize Supabase**
   ```bash
   npx supabase init
   ```

2. **Link to Your Project**
   ```bash
   npx supabase link --project-ref djccmatubyyudeosrngm
   ```

3. **Apply Migrations**
   ```bash
   npx supabase db push
   ```

### Option 3: Manual Table Creation (Minimal)

If you just want to test the app quickly, create these essential tables:

```sql
-- 1. Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  wallet_balance DECIMAL(10,2) DEFAULT 0.0,
  total_earned DECIMAL(10,2) DEFAULT 0.0,
  total_spent DECIMAL(10,2) DEFAULT 0.0,
  rating_as_driver DECIMAL(3,2) DEFAULT 0.0,
  rating_as_passenger DECIMAL(3,2) DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Trips table
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  departure_time TIMESTAMPTZ NOT NULL,
  available_seats INTEGER NOT NULL CHECK (available_seats >= 1),
  price_per_seat DECIMAL(10,2) NOT NULL CHECK (price_per_seat >= 0),
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seats_requested INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, passenger_id)
);

-- 4. Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Public profiles viewable" ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Published trips viewable" ON trips FOR SELECT USING (TRUE);
CREATE POLICY "Drivers manage own trips" ON trips FOR ALL USING (auth.uid() = driver_id);

CREATE POLICY "Users view own bookings" ON bookings FOR SELECT USING (
  auth.uid() = passenger_id OR
  EXISTS (SELECT 1 FROM trips WHERE trips.id = bookings.trip_id AND trips.driver_id = auth.uid())
);
CREATE POLICY "Passengers create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = passenger_id);

CREATE POLICY "Users view own messages" ON messages FOR SELECT USING (auth.uid() = sender_id);
CREATE POLICY "Users send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
```

## 🧪 Test Connection After Setup

```bash
node test-full-connectivity.js
```

You should see:
- ✅ Backend API: PASS
- ✅ Table: profiles: PASS
- ✅ Table: trips: PASS
- ✅ Table: bookings: PASS
- ✅ Table: messages: PASS

## 🚀 Start Development

Once tables are created:

```bash
npm run dev
```

Visit: http://localhost:3000

## 📚 Full Schema

For production deployment, use the complete schema:
- File: `src/supabase/schema.sql`
- Includes: All tables, indexes, triggers, RLS policies, and functions

## ❓ Need Help?

- Supabase Docs: https://supabase.com/docs
- SQL Editor: https://supabase.com/dashboard/project/djccmatubyyudeosrngm/sql
- Support: support@wasel.app
