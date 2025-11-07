# 🚀 Quick Fix - Database Setup

## Problem
❌ Tables missing: `trips`, `bookings`, `messages`, etc.

## Solution (2 Minutes)

### Step 1: Open SQL Editor
Click this link: https://supabase.com/dashboard/project/djccmatubyyudeosrngm/sql/new

### Step 2: Copy SQL Script
Open file: `create-tables.sql` (in this folder)
- Press `Ctrl+A` to select all
- Press `Ctrl+C` to copy

### Step 3: Run in Supabase
- Paste the SQL into the editor (`Ctrl+V`)
- Click the green "Run" button
- Wait for success message (✅)

### Step 4: Verify
Run this command:
```bash
node test-full-connectivity.js
```

You should see all ✅ green checkmarks!

## Alternative: Use Batch Script (Windows)
```bash
fix-database.cmd
```

This will:
1. Open SQL Editor automatically
2. Guide you through the process
3. Test the connection

## What Gets Created?
- ✅ profiles table
- ✅ trips table
- ✅ bookings table
- ✅ messages table
- ✅ notifications table
- ✅ vehicles table
- ✅ reviews table
- ✅ All indexes
- ✅ All security policies
- ✅ All triggers

## After Setup
Start your app:
```bash
npm run dev
```

Visit: http://localhost:3000

## Need Help?
- SQL Editor: https://supabase.com/dashboard/project/djccmatubyyudeosrngm/sql
- Full Guide: SETUP_DATABASE.md
