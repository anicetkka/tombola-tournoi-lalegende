@echo off
echo ========================================
echo Activation de l'administrateur
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

echo Activation de l'administrateur...
cd server
node scripts/activateAdmin.js
if %errorlevel% neq 0 (
    echo Erreur lors de l'activation de l'administrateur
    pause
    exit /b 1
)

cd ..
echo.
echo ========================================
echo Administrateur active avec succes !
echo ========================================
echo.
echo Vous pouvez maintenant vous connecter en tant qu'administrateur
echo et utiliser toutes les fonctionnalites admin.
echo.
pause
