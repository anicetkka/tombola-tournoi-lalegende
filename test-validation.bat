@echo off
echo ========================================
echo Test de validation des participations
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

echo Verification du serveur...
curl -s http://localhost:5000/api/tombolas >nul 2>&1
if %errorlevel% neq 0 (
    echo Le serveur n'est pas accessible sur le port 5000.
    echo Veuillez d'abord lancer : start-app.bat
    pause
    exit /b 1
)

echo.
echo ========================================
echo Test de validation des participations
echo ========================================
echo.
echo 1. Connectez-vous en tant qu'admin
echo 2. Allez dans "Gestion des Participations"
echo 3. Cliquez sur "Valider" ou "Rejeter" pour une participation en attente
echo.
echo Si cela ne fonctionne pas, verifiez la console du navigateur (F12)
echo pour voir les erreurs detaillees.
echo.
pause
