@echo off
chcp 65001 >nul
echo ========================================
echo FlowDoc Pro - GitHub Pages Deploy Script
echo ========================================
echo.

REM Change to script directory
cd /d "%~dp0"

REM Step 1: Check if index.js is updated
echo [Step 1/6] Checking index.js...
if not exist "src\index.js" (
    echo ERROR: src\index.js not found!
    echo Current directory: %CD%
    pause
    exit /b 1
)

findstr /C:"AuthProvider" "src\index.js" >nul 2>&1
if errorlevel 1 (
    echo ERROR: index.js is not updated!
    echo Please update src\index.js with AuthProvider
    echo.
    echo The file exists but doesn't contain AuthProvider.
    echo Please add AuthProvider to src\index.js
    pause
    exit /b 1
)
echo OK: index.js is updated with AuthProvider
echo.

REM Step 2: Install gh-pages if not installed
echo [Step 2/6] Checking gh-pages package...
call npm list gh-pages >nul 2>&1
if errorlevel 1 (
    echo Installing gh-pages...
    call npm install --save-dev gh-pages
    if errorlevel 1 (
        echo ERROR: Failed to install gh-pages
        pause
        exit /b 1
    )
) else (
    echo OK: gh-pages is already installed
)
echo.

REM Step 3: Run tests (optional)
echo [Step 3/6] Local test check...
echo Skipping local test (you can run 'npm start' manually before deploying)
echo.

REM Step 4: Build
echo [Step 4/6] Building production version...
echo This may take a few minutes...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed!
    echo Please check the error messages above.
    pause
    exit /b 1
)
echo OK: Build completed successfully
echo.

REM Step 5: Git commit
echo [Step 5/6] Committing to Git...
git add .
git commit -m "feat: Update with login feature (v2.1)"
if errorlevel 1 (
    echo Note: No changes to commit or commit failed
    echo.
)
git push origin main
if errorlevel 1 (
    echo WARNING: Git push failed or no changes to commit
    echo This is OK if you've already pushed the changes.
    echo.
    echo Continue with deployment? (Y/N)
    set /p continue=
    if /i not "%continue%"=="Y" (
        echo Deployment cancelled.
        pause
        exit /b 1
    )
)
echo.

REM Step 6: Deploy
echo [Step 6/6] Deploying to GitHub Pages...
echo This will take a moment...
call npm run deploy
if errorlevel 1 (
    echo ERROR: Deploy failed!
    echo Please check the error messages above.
    pause
    exit /b 1
)
echo.

echo ========================================
echo Deploy Completed Successfully!
echo ========================================
echo.
echo Your app is now live at:
echo https://koseitoyonaga.github.io/flowdoc-pro/
echo.
echo Demo Account:
echo   Email: demo@example.com
echo   Password: demo123
echo.
echo It may take 5-10 minutes for changes to appear.
echo Please wait a few minutes before accessing the URL.
echo.
pause
