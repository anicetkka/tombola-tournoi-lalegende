@echo off
echo ========================================
echo Verification du systeme Tombola CI
echo ========================================
echo.

echo [1/5] Verification de Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installe
    echo    Installez Node.js 18+ depuis https://nodejs.org
) else (
    for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js %%i est installe
)

echo.
echo [2/5] Verification de MongoDB...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MongoDB n'est pas installe
    echo    Lancez : install-mongodb.bat
) else (
    for /f "tokens=*" %%i in ('mongod --version ^| findstr "db version"') do echo ✅ MongoDB %%i est installe
)

echo.
echo [3/5] Verification du service MongoDB...
sc query MongoDB | find "RUNNING" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MongoDB n'est pas en cours d'execution
    echo    Lancez : install-mongodb.bat
) else (
    echo ✅ MongoDB est en cours d'execution
)

echo.
echo [4/5] Verification des dependances...
if not exist "node_modules" (
    echo ❌ Dependances racine manquantes
    echo    Lancez : install.bat
) else (
    echo ✅ Dependances racine installees
)

if not exist "server\node_modules" (
    echo ❌ Dependances serveur manquantes
    echo    Lancez : install.bat
) else (
    echo ✅ Dependances serveur installees
)

if not exist "client\node_modules" (
    echo ❌ Dependances client manquantes
    echo    Lancez : install.bat
) else (
    echo ✅ Dependances client installees
)

echo.
echo [5/5] Verification de la configuration...
if not exist "server\.env" (
    echo ❌ Fichier de configuration manquant
    echo    Lancez : start-app.bat (il sera cree automatiquement)
) else (
    echo ✅ Fichier de configuration present
)

echo.
echo ========================================
echo Resume de la verification
echo ========================================
echo.

echo Pour demarrer l'application :
echo 1. Si des elements sont manquants, lancez les scripts correspondants
echo 2. Une fois tout installe, lancez : start-app.bat
echo 3. Pour creer un admin, lancez : setup-admin.bat
echo.

echo Scripts disponibles :
echo - install.bat : Installation des dependances Node.js
echo - install-mongodb.bat : Installation et demarrage de MongoDB
echo - start-app.bat : Demarrage de l'application
echo - setup-admin.bat : Creation d'un administrateur
echo - create-test-data.bat : Creation de donnees de test
echo.

pause
