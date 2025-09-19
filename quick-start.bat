@echo off
echo ========================================
echo Demarrage Rapide - Tombola Cote d'Ivoire
echo ========================================
echo.

echo Ce script va :
echo 1. Verifier et installer les dependances
echo 2. Installer et demarrer MongoDB
echo 3. Creer un administrateur
echo 4. Demarrer l'application
echo.

set /p choice="Voulez-vous continuer ? (O/N): "
if /i not "%choice%"=="O" (
    echo Annule.
    pause
    exit /b 0
)

echo.
echo [ETAPE 1/4] Installation des dependances...
call install.bat
if %errorlevel% neq 0 (
    echo Erreur lors de l'installation des dependances
    pause
    exit /b 1
)

echo.
echo [ETAPE 2/4] Installation et demarrage de MongoDB...
call install-mongodb.bat
if %errorlevel% neq 0 (
    echo Erreur lors de l'installation de MongoDB
    pause
    exit /b 1
)

echo.
echo [ETAPE 3/4] Creation de l'administrateur...
call setup-admin.bat
if %errorlevel% neq 0 (
    echo Erreur lors de la creation de l'administrateur
    pause
    exit /b 1
)

echo.
echo [ETAPE 4/4] Demarrage de l'application...
echo.
echo ========================================
echo Installation et configuration terminees !
echo ========================================
echo.
echo L'application va maintenant demarrer...
echo.
echo Identifiants de connexion :
echo Téléphone : +2250000000000
echo Mot de passe : Admin123!
echo.
echo Appuyez sur Ctrl+C pour arreter l'application
echo.

call start-app.bat
