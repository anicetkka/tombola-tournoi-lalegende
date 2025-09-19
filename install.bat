@echo off
echo ========================================
echo Installation de Tombola Cote d'Ivoire
echo ========================================
echo.

echo Verification de Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js n'est pas installe sur ce systeme.
    echo Veuillez installer Node.js 18+ depuis https://nodejs.org
    pause
    exit /b 1
)

echo Node.js est installe.
echo.

echo Installation des dependances racine...
call npm install
if %errorlevel% neq 0 (
    echo Erreur lors de l'installation des dependances racine
    pause
    exit /b 1
)

echo.
echo Installation des dependances serveur...
cd server
call npm install
if %errorlevel% neq 0 (
    echo Erreur lors de l'installation des dependances serveur
    pause
    exit /b 1
)

echo.
echo Installation des dependances client...
cd ..\client
call npm install
if %errorlevel% neq 0 (
    echo Erreur lors de l'installation des dependances client
    pause
    exit /b 1
)

cd ..

echo.
echo Creation du fichier de configuration...
if not exist "server\.env" (
    copy "server\config.env.example" "server\.env"
    echo Fichier server\.env cree a partir de l'exemple.
) else (
    echo Fichier server\.env existe deja.
)

echo.
echo ========================================
echo Installation terminee avec succes !
echo ========================================
echo.
echo Prochaines etapes :
echo 1. Lancez : install-mongodb.bat (pour installer MongoDB)
echo 2. Lancez : start-app.bat (pour demarrer l'application)
echo 3. Lancez : setup-admin.bat (pour creer un administrateur)
echo.
echo Ou consultez le GUIDE-DEMARRAGE.md pour plus de details.
echo.
pause
