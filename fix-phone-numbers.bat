@echo off
echo ========================================
echo Correction des numeros de telephone
echo ========================================
echo.

echo Verification de MongoDB...
sc query MongoDB | find "RUNNING" >nul 2>&1
if %errorlevel% neq 0 (
    echo MongoDB n'est pas en cours d'execution.
    echo Veuillez d'abord lancer : start-app.bat
    pause
    exit /b 1
)

echo Verification du fichier de configuration...
if not exist "server\.env" (
    echo Le fichier server\.env n'existe pas.
    echo Veuillez d'abord lancer : start-app.bat
    pause
    exit /b 1
)

echo Correction des numeros de telephone...
cd server
node scripts/fixPhoneNumbers.js
if %errorlevel% neq 0 (
    echo Erreur lors de la correction des numeros
    pause
    exit /b 1
)

cd ..
echo.
echo ========================================
echo Correction terminee avec succes !
echo ========================================
echo.
echo Les numeros de telephone ont ete corriges pour respecter le format +225XXXXXXXXXX
echo.
pause
