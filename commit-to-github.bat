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
git commit -m "Fix commission percentage display and optimize booking APIs

- Fixed percentage display in admin webapp booking management
- Updated revenue ledger service to store correct percentages in pct column  
- Modified booking APIs to query from revenue_ledger instead of recalculating
- Fixed booking 21 referrer percentage display (now shows 6%% correctly)
- Optimized commission calculation performance by using stored data
- Updated admin webapp to use formatCommission for proper percentage display
- Reordered table columns: Provider -> Seller -> Referrer -> Manager

Technical changes:
- backend/src/revenue/revenue-ledger.service.ts: Store rank-based percentages in pct column
- backend/src/bookings/bookings.service.ts: Query from revenue_ledger for performance
- backend/src/commission/commission-calculator.service.ts: Use stored ledger data
- admin-webapp/src/pages/Bookings.tsx: Use formatCommission and reorder columns
- backend/recalculate-revenue.js: Updated to store correct percentages"

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
