# 🔐 Wasel Login Instructions

## Demo Mode (No Backend Required)

The application is currently running in **DEMO MODE** - you can login without any backend setup!

### Quick Login Steps:

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Open your browser:**
   - The app will open at `http://localhost:3000`

3. **Click "Get Started" or "Login"**

4. **Enter ANY credentials:**
   - Email: `demo@wasel.app` (or any email)
   - Password: `password123` (or any password)
   - Click "Sign In"

5. **You're in!** 🎉
   - The app will log you in with demo data
   - You can explore all features

---

## What You Can Do in Demo Mode:

✅ **View Dashboard** - See your trip statistics and overview
✅ **Find Rides** - Browse available trips (demo data)
✅ **Offer Rides** - Create new trip offers
✅ **My Trips** - View your trip history
✅ **Messages** - See messaging interface
✅ **Payments** - View wallet and transactions
✅ **Settings** - Update your profile
✅ **Safety Center** - Access safety features
✅ **Referral Program** - View referral system

---

## Demo User Profile:

When you login in demo mode, you'll be logged in as:

- **Name:** Demo User
- **Email:** demo@wasel.app
- **Phone:** +966 50 123 4567
- **Rating (Driver):** 4.8 ⭐
- **Rating (Passenger):** 4.9 ⭐
- **Total Trips:** 42
- **Wallet Balance:** 150.50 SAR

---

## Connecting to Real Backend (Optional)

If you want to connect to a real Supabase backend:

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up and create a new project
3. Wait for project initialization

### Step 2: Setup Database
1. Go to SQL Editor in Supabase Dashboard
2. Copy content from `src/supabase/schema.sql`
3. Paste and run the SQL

### Step 3: Get Credentials
1. Go to Project Settings → API
2. Copy your project URL
3. Copy your anon/public key

### Step 4: Update .env File
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 5: Restart Server
```bash
npm run dev
```

Now you can create real accounts and use the full backend!

---

## Troubleshooting

### Can't Login?
- Make sure the app is running (`npm run dev`)
- Check browser console for errors (F12)
- Try refreshing the page

### Port Already in Use?
```bash
npx kill-port 3000
npm run dev
```

### Dependencies Issues?
```bash
npm install
npm run dev
```

---

## Application Flow

### 1. Landing Page
- First screen you see
- Click "Get Started" to signup
- Click "Login" to signin

### 2. Authentication
- Enter any email/password in demo mode
- Real backend requires valid credentials

### 3. Dashboard
- Main hub after login
- View stats, trips, notifications
- Quick actions for common tasks

### 4. Navigation
- Use sidebar menu (left side)
- Click hamburger icon on mobile
- Access all features from menu

### 5. Features
- **Find Ride:** Search and book trips
- **Offer Ride:** Create trips as driver
- **My Trips:** Manage your bookings
- **Messages:** Chat with users
- **Payments:** Manage wallet
- **Profile:** Update your info

---

## Tips for Testing

1. **Try Different Roles:**
   - Test as passenger (Find Ride)
   - Test as driver (Offer Ride)

2. **Explore All Pages:**
   - Click through all menu items
   - Test responsive design (resize browser)

3. **Check Console:**
   - Open DevTools (F12)
   - Look for demo mode messages
   - Check for any errors

4. **Test Workflows:**
   - Complete booking flow
   - Create a trip
   - Send a message
   - Update profile

---

## Need Help?

- Check `STARTUP_GUIDE.md` for more details
- Review `README.md` for project overview
- Check browser console for debug info
- Ensure all dependencies are installed

---

**Enjoy exploring Wasel! 🚗💨**
