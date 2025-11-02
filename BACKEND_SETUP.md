# 🔧 Wasel Backend Setup - Step by Step

## ⚡ Quick Setup (15 minutes)

### Step 1: Create Supabase Account (2 min)

1. Go to **https://supabase.com**
2. Click "Start your project"
3. Sign up with GitHub/Google/Email
4. Verify your email

---

### Step 2: Create New Project (3 min)

1. Click "New Project"
2. Fill in:
   - **Name:** `wasel-app` (or your choice)
   - **Database Password:** Create a strong password (SAVE THIS!)
   - **Region:** Choose closest to you
   - **Pricing Plan:** Free (sufficient for testing)
3. Click "Create new project"
4. **Wait 2-3 minutes** for project initialization

---

### Step 3: Setup Database Schema (5 min)

1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Open file: `src/supabase/schema.sql` in your project
4. **Copy ALL content** from that file
5. **Paste** into Supabase SQL Editor
6. Click **"Run"** button (or press Ctrl+Enter)
7. Wait for success message ✅

**Note:** If you get errors about extensions, run this first:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

---

### Step 4: Get Your Credentials (2 min)

1. Go to **Settings** → **API** (left sidebar)
2. Find and copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

---

### Step 5: Update Environment Variables (1 min)

1. Open `.env` file in your project root
2. Replace with your credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Save the file

---

### Step 6: Restart Application (1 min)

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## ✅ Verify Backend Connection

### Test 1: Check Console
- Open browser console (F12)
- Look for: `✅ Backend validation successful`
- Should NOT see demo mode messages

### Test 2: Create Real Account
1. Click "Get Started"
2. Enter real email and password
3. Check your email for verification
4. Login with your credentials

### Test 3: Create a Trip
1. Go to "Offer Ride"
2. Fill in trip details
3. Click "Publish Trip"
4. Check if trip appears in database

---

## 🔍 Troubleshooting

### Error: "Backend connection failed"

**Solution 1:** Check credentials
```bash
# Verify .env file has correct values
# No quotes around values
# No extra spaces
```

**Solution 2:** Check Supabase project status
- Go to Supabase dashboard
- Ensure project is "Active" (green dot)
- Check if database is running

**Solution 3:** Verify schema was applied
- Go to SQL Editor
- Run: `SELECT * FROM profiles LIMIT 1;`
- Should return empty result (not error)

---

### Error: "relation does not exist"

**Cause:** Database schema not applied

**Solution:**
1. Go to SQL Editor in Supabase
2. Re-run the schema.sql file
3. Check for any error messages
4. Fix errors and run again

---

### Error: "Invalid API key"

**Cause:** Wrong anon key copied

**Solution:**
1. Go to Settings → API
2. Copy the **anon** key (not service_role)
3. Update .env file
4. Restart server

---

### Can't create account

**Cause:** Email confirmation required

**Solution:**
1. Go to Authentication → Settings
2. Disable "Enable email confirmations"
3. Try signup again

---

## 📊 Verify Database Tables

Run this in SQL Editor to check tables:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:
- profiles
- trips
- bookings
- vehicles
- messages
- notifications
- reviews
- transactions
- etc.

---

## 🎯 Next Steps After Backend Setup

### 1. Enable Authentication
- Go to Authentication → Settings
- Configure email templates
- Set up OAuth providers (optional)

### 2. Configure Storage (Optional)
- Go to Storage
- Create bucket: `avatars`
- Create bucket: `documents`
- Set public access policies

### 3. Setup Realtime (Optional)
- Go to Database → Replication
- Enable realtime for:
  - messages
  - notifications
  - bookings

### 4. Add Test Data
```sql
-- Create test user profile (after signup)
INSERT INTO profiles (id, email, full_name, phone)
VALUES (
  auth.uid(),
  'test@example.com',
  'Test User',
  '+1234567890'
);

-- Create test trip
INSERT INTO trips (
  driver_id, from_location, from_lat, from_lng,
  to_location, to_lat, to_lng,
  departure_date, departure_time,
  available_seats, price_per_seat, trip_type
) VALUES (
  auth.uid(),
  'Dubai', 25.2048, 55.2708,
  'Abu Dhabi', 24.4539, 54.3773,
  CURRENT_DATE + 1, '08:00',
  3, 50.00, 'wasel'
);
```

---

## 🔐 Security Checklist

- [ ] Database password is strong
- [ ] .env file is in .gitignore
- [ ] RLS policies are enabled
- [ ] API keys are not committed to git
- [ ] Email confirmation is configured
- [ ] Rate limiting is enabled

---

## 📱 Test Full Flow

1. **Signup** → Create new account
2. **Login** → Use real credentials
3. **Profile** → Update your profile
4. **Offer Ride** → Create a trip
5. **Find Ride** → Search for trips
6. **Book Ride** → Book a trip (use different account)
7. **Messages** → Send a message
8. **Payments** → Check wallet

---

## 🎉 Success!

Your backend is now connected! The app will:
- ✅ Store real data in Supabase
- ✅ Authenticate real users
- ✅ Sync across devices
- ✅ Support real-time features

---

## 📚 Additional Resources

- **Supabase Docs:** https://supabase.com/docs
- **SQL Reference:** https://www.postgresql.org/docs/
- **PostGIS Docs:** https://postgis.net/docs/
- **Wasel API Docs:** `src/services/api.ts`

---

## 💡 Pro Tips

1. **Backup your database:**
   - Settings → Database → Backups
   - Enable automatic backups

2. **Monitor usage:**
   - Check Database → Usage
   - Stay within free tier limits

3. **Use migrations:**
   - Create migration files for schema changes
   - Version control your database

4. **Test locally:**
   - Use Supabase CLI for local development
   - Run: `npx supabase init`

---

**Need help? Check the console logs or create an issue!**
