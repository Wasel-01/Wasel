# 🚀 Wasel - Quick Startup Guide

## Getting Started in 3 Steps

### 1. Install Dependencies (if not already done)
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

### 3. Open Your Browser
The app will automatically open at `http://localhost:3000`

---

## 🎭 Demo Mode (No Backend Required)

The app is configured to run in **demo mode** by default. You can:
- ✅ View the landing page
- ✅ Navigate through the UI
- ✅ See demo data
- ✅ Test the user interface

**Demo Login Credentials:**
- Email: `demo@wasel.app`
- Password: `any password` (demo mode accepts any password)

---

## 🔧 Connect to Real Backend (Optional)

To connect to a real Supabase backend:

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready

### Step 2: Run Database Migrations
```bash
# Copy the SQL from src/supabase/schema.sql
# Paste it into Supabase SQL Editor
# Run the migration
```

### Step 3: Update Environment Variables
Edit `.env` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Restart the Server
```bash
npm run dev
```

---

## 📱 Application Flow

### For Passengers:
1. **Sign Up/Login** → Create account or login
2. **Find Ride** → Search for available trips
3. **Book Ride** → Select and book a trip
4. **Track Trip** → View trip details and driver info
5. **Rate Trip** → Rate your experience after completion

### For Drivers:
1. **Sign Up/Login** → Create account or login
2. **Offer Ride** → Create a new trip
3. **Manage Bookings** → Accept/reject passenger requests
4. **Start Trip** → Begin the journey
5. **Complete Trip** → End trip and receive payment

---

## 🎯 Key Features to Explore

### Dashboard
- View your upcoming trips
- Check your earnings/spending
- See recent notifications

### Find Ride
- Search trips by location
- Filter by date, price, seats
- View driver ratings

### Offer Ride
- Create one-time trips
- Set up recurring trips
- Manage vehicle details

### My Trips
- View trip history
- Track active trips
- Manage bookings

### Messages
- Chat with drivers/passengers
- Real-time messaging
- Trip-related conversations

### Payments
- View transaction history
- Manage wallet balance
- Payment methods

### Safety Center
- Emergency contacts
- SOS button
- Safety tips

### Referral Program
- Share referral code
- Earn rewards
- Track referrals

---

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Kill the process using port 3000
npx kill-port 3000
npm run dev
```

### Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Check TypeScript errors
npm run typecheck

# Try building
npm run build
```

---

## 📚 Additional Resources

- [Feature Specification](src/FEATURE_SPEC.md)
- [Developer Guide](src/DEVELOPER_GUIDE.md)
- [Backend Setup](src/BACKEND_SETUP_GUIDE.md)
- [Quick Start](QUICK_START.md)

---

## 💡 Tips

1. **Demo Mode**: Perfect for UI/UX testing without backend setup
2. **Hot Reload**: Changes auto-refresh in development
3. **Mobile View**: Resize browser to test responsive design
4. **Console Logs**: Check browser console for helpful debug info

---

## 🎉 You're Ready!

Run `npm run dev` and start exploring Wasel!

For questions or issues, check the documentation or create an issue on GitHub.
