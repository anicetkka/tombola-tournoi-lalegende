@echo off
echo ========================================
echo Deploiement sur Firebase
echo ========================================
echo.

cd /d "%~dp0"

echo Verification de Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Node.js n'est pas installe ou pas dans le PATH
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

echo Verification de Firebase CLI...
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Firebase CLI n'est pas installe
    echo Veuillez installer Firebase CLI avec: npm install -g firebase-tools
    pause
    exit /b 1
)

echo.
echo Construction du frontend...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo ERREUR: Echec de la construction du frontend
    pause
    exit /b 1
)

echo.
echo Installation des dependances du backend...
cd ..\server\functions
call npm install
if %errorlevel% neq 0 (
    echo ERREUR: Echec de l'installation des dependances
    pause
    exit /b 1
)

echo.
echo Deploiement sur Firebase...
cd ..\..
firebase deploy
if %errorlevel% neq 0 (
    echo ERREUR: Echec du deploiement
    pause
    exit /b 1
)

echo.
echo Deploiement termine avec succes !
echo.
echo Votre application est disponible sur :
echo - Frontend: https://tombola-cote-ivoire.web.app
echo - Backend API: https://us-central1-tombola-cote-ivoire.cloudfunctions.net/api
echo.
pause
