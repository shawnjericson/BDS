@echo off
echo 🚀 Committing BDS project to GitHub...

REM Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed or not in PATH
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

REM Initialize git if not already initialized
if not exist .git (
    echo 📁 Initializing git repository...
    git init
)

REM Add remote if not exists
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔗 Adding remote repository...
    git remote add origin https://github.com/shawnjericson/BDS.git
)

REM Add all files
echo 📦 Adding all files...
git add .

REM Commit with detailed message
echo 💾 Committing changes...
git commit -m "Fix commission percentage display in admin booking management

CRITICAL FIX: Fixed booking 21 referrer percentage display from 0.3%% to 6.0000%% correctly

Key Changes:
- Fixed getBookingCommissionFromLedger() to use entry.pct from database instead of calculating (amount/bookingPrice)*100
- Updated admin webapp to use formatCommission() for all percentage displays
- Maintained original commission calculation logic (no changes to business rules)
- Only optimized data retrieval from revenue_ledger for admin display

Technical Details:
- backend/src/revenue/revenue-ledger.service.ts: Use Number(entry.pct || 0) instead of (amount/bookingPrice)*100
- admin-webapp/src/pages/Bookings.tsx: Replace percentage.toFixed(4)%% with formatCommission()
- Revenue ledger already contains correct pct values, just needed to use them properly

Result: Booking 21 referrer now shows 6.0000%% (rank 5 = 6%%) instead of incorrect 0.3%%"

REM Push to GitHub
echo 🚀 Pushing to GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo ✅ Successfully pushed to GitHub!
    echo 🌐 Repository: https://github.com/shawnjericson/BDS
) else (
    echo ❌ Failed to push to GitHub
    echo Please check your credentials and network connection
)

pause
