@echo off
cls
echo ========================================
echo    WASEL - Complete System Verification
echo ========================================
echo.

echo [1/5] Checking Node.js and npm...
node --version
npm --version
echo ✅ Node.js and npm installed
echo.

echo [2/5] Checking dependencies...
if exist "node_modules\terser" (
    echo ✅ Terser installed
) else (
    echo ❌ Terser missing - Installing...
    npm install terser --save-dev
)
echo.

echo [3/5] Running TypeScript check...
call npm run typecheck
if %errorlevel% equ 0 (
    echo ✅ TypeScript check passed
) else (
    echo ❌ TypeScript errors found
)
echo.

echo [4/5] Testing build system...
echo Building project (this may take 30-40 seconds)...
call npm run build
if %errorlevel% equ 0 (
    echo ✅ Build successful
) else (
    echo ❌ Build failed
)
echo.

echo [5/5] Checking backend connectivity...
node test-full-connectivity.js
echo.

echo ========================================
echo    Verification Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. If tables are missing, run: fix-database.cmd
echo 2. Start development: npm run dev
echo 3. Visit: http://localhost:3000
echo.
pause
