@echo off
echo ========================================
echo Installation de MongoDB pour Tombola CI
echo ========================================
echo.

echo Verification de MongoDB...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo MongoDB n'est pas installe sur ce systeme.
    echo.
    echo Veuillez installer MongoDB manuellement :
    echo 1. Allez sur https://www.mongodb.com/try/download/community
    echo 2. Telechargez MongoDB Community Server pour Windows
    echo 3. Installez-le avec les options par defaut
    echo 4. Relancez ce script
    echo.
    pause
    exit /b 1
)

echo MongoDB est installe.
echo.

echo Demarrage de MongoDB...
echo Creation du dossier de donnees...
if not exist "C:\data\db" mkdir "C:\data\db"

echo Demarrage du service MongoDB...
net start MongoDB >nul 2>&1
if %errorlevel% neq 0 (
    echo Le service MongoDB n'est pas demarre. Tentative de demarrage...
    mongod --dbpath "C:\data\db" --logpath "C:\data\db\mongod.log" --install
    net start MongoDB
    if %errorlevel% neq 0 (
        echo Erreur lors du demarrage de MongoDB.
        echo Essayez de demarrer manuellement : mongod --dbpath "C:\data\db"
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo MongoDB est maintenant en cours d'execution !
echo ========================================
echo.
echo Vous pouvez maintenant :
echo 1. Configurer le fichier server\.env
echo 2. Lancer l'application avec : npm run dev
echo.
pause
