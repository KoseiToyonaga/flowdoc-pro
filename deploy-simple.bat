@echo off
chcp 65001 >nul
echo ========================================
echo FlowDoc Pro - Simple Deploy
echo ========================================
echo.

cd /d "%~dp0"

echo Installing gh-pages (if needed)...
call npm install --save-dev gh-pages
echo.

echo Building...
call npm run build
if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)
echo.

echo Deploying to GitHub Pages...
call npm run deploy
if errorlevel 1 (
    echo Deploy failed!
    pause
    exit /b 1
)
echo.

echo ========================================
echo Success!
echo ========================================
echo.
echo URL: https://koseitoyonaga.github.io/flowdoc-pro/
echo.
echo Wait 5-10 minutes for changes to appear.
echo.
pause
