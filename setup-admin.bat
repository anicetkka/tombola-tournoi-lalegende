@echo off
echo ========================================
echo Creation de l'utilisateur administrateur
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

echo Creation de l'utilisateur administrateur...
cd server
node scripts/createAdmin.js
if %errorlevel% neq 0 (
    echo Erreur lors de la creation de l'administrateur
    pause
    exit /b 1
)

cd ..
echo.
echo ========================================
echo Administrateur cree avec succes !
echo ========================================
echo.
echo Identifiants de connexion :
echo Téléphone : +2250000000000
echo Mot de passe : Admin123!
echo.
echo IMPORTANT : Changez ce mot de passe apres votre premiere connexion !
echo.
pause
