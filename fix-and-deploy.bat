@echo off
chcp 65001 >nul
echo ========================================
echo GitHub Pages Fix - Deploy Script
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Creating .nojekyll file...
echo. > public\.nojekyll
echo OK: .nojekyll created
echo.

echo [2/3] Building...
call npm run build
if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)
echo.

echo [3/3] Deploying...
call npm run deploy
if errorlevel 1 (
    echo Deploy failed!
    pause
    exit /b 1
)
echo.

echo ========================================
echo Success! Fixed and Deployed
echo ========================================
echo.
echo Wait 5-10 minutes, then visit:
echo https://koseitoyonaga.github.io/flowdoc-pro/
echo.
echo You should see the LOGIN PAGE now!
echo.
pause
