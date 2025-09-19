@echo off
echo ========================================
echo Seeding des messages de contact
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

echo Verification de MongoDB...
where mongod >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: MongoDB n'est pas installe ou pas dans le PATH
    echo Veuillez installer MongoDB depuis https://www.mongodb.com/try/download/community
    pause
    exit /b 1
)

echo Verification du service MongoDB...
sc query MongoDB >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Le service MongoDB n'est pas demarre
    echo Veuillez demarrer MongoDB avec: net start MongoDB
    pause
    exit /b 1
)

echo Verification du fichier de configuration...
if not exist "server\config.env" (
    echo ERREUR: Le fichier server\config.env n'existe pas
    echo Veuillez copier server\config.env.example vers server\config.env
    echo et configurer les variables d'environnement
    pause
    exit /b 1
)

echo.
echo Demarrage du seeding...
echo.

cd server
node scripts/seedContactMessages.js

echo.
echo Seeding termine !
echo.
pause
