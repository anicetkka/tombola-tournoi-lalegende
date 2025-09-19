@echo off
echo ========================================
echo Ajout des numeros de participation
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

echo Ajout des numeros de participation...
cd server
node scripts/addParticipationNumbers.js
if %errorlevel% neq 0 (
    echo Erreur lors de l'ajout des numeros de participation
    pause
    exit /b 1
)

cd ..
echo.
echo ========================================
echo Numeros de participation ajoutes !
echo ========================================
echo.
echo Chaque participation a maintenant un numero unique
echo au format TOM + annee + mois + jour + 6 chiffres.
echo.
echo Exemple: TOM241218123456
echo.
pause
