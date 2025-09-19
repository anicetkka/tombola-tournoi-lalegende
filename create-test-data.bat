@echo off
echo ========================================
echo Creation des donnees de test
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

echo Creation des donnees de test...
cd server
node scripts/seedData.js
if %errorlevel% neq 0 (
    echo Erreur lors de la creation des donnees de test
    pause
    exit /b 1
)

cd ..
echo.
echo ========================================
echo Donnees de test creees avec succes !
echo ========================================
echo.
echo Vous pouvez maintenant vous connecter avec :
echo - Admin: +2250000000000 / Admin123!
echo - Utilisateur: +2250000000001 / User123!
echo.
pause
