@echo off
echo ========================================
echo Wasel Database Setup
echo ========================================
echo.

echo Step 1: Opening Supabase SQL Editor...
echo.
start https://supabase.com/dashboard/project/djccmatubyyudeosrngm/sql/new

echo Step 2: Instructions
echo.
echo 1. The SQL Editor should open in your browser
echo 2. Copy the content from: create-tables.sql
echo 3. Paste it into the SQL Editor
echo 4. Click "Run" button
echo 5. Wait for success message
echo.

echo Step 3: After running the SQL, press any key to test connection...
pause

echo.
echo Testing database connection...
node test-full-connectivity.js

echo.
echo ========================================
echo Setup Complete!
echo ========================================
pause
