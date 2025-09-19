@echo off
echo ========================================
echo Demarrage de Tombola Cote d'Ivoire
echo ========================================
echo.

echo Verification de MongoDB...
set MONGODB_PATH=

:: Recherche de MongoDB
if exist "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files\MongoDB\Server\8.0\bin
    goto :mongodb_found
)
if exist "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files\MongoDB\Server\6.0\bin
    goto :mongodb_found
)
if exist "C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files\MongoDB\Server\5.0\bin
    goto :mongodb_found
)
if exist "C:\Program Files (x86)\MongoDB\Server\8.0\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files (x86)\MongoDB\Server\8.0\bin
    goto :mongodb_found
)
if exist "C:\Program Files (x86)\MongoDB\Server\6.0\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files (x86)\MongoDB\Server\6.0\bin
    goto :mongodb_found
)
if exist "C:\Program Files (x86)\MongoDB\Server\5.0\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files (x86)\MongoDB\Server\5.0\bin
    goto :mongodb_found
)

echo ❌ MongoDB non trouve !
echo Veuillez installer MongoDB depuis : https://www.mongodb.com/try/download/community
pause
exit /b 1

:mongodb_found
echo ✅ MongoDB trouve dans : %MONGODB_PATH%

echo Verification du service MongoDB...
sc query MongoDB | find "RUNNING" >nul 2>&1
if %errorlevel% neq 0 (
    echo Demarrage de MongoDB...
    net start MongoDB >nul 2>&1
    if %errorlevel% neq 0 (
        echo Service MongoDB non disponible. Demarrage manuel...
        echo.
        echo MongoDB va demarrer dans une nouvelle fenetre.
        echo Fermez cette fenetre pour arreter MongoDB.
        echo.
        start "MongoDB" "%MONGODB_PATH%\mongod.exe" --dbpath "C:\data\db"
        timeout /t 3 /nobreak >nul
    )
)

echo MongoDB est en cours d'execution.
echo.

echo Verification du fichier de configuration...
if not exist "server\.env" (
    echo Creation du fichier de configuration...
    copy "server\config.env.example" "server\.env"
    echo.
    echo ATTENTION : Veuillez configurer le fichier server\.env
    echo avec vos parametres avant de continuer.
    echo.
    pause
)

echo Demarrage de l'application...
echo.
echo L'application va demarrer sur :
echo - Frontend : http://localhost:3000
echo - Backend  : http://localhost:5000
echo.
echo Appuyez sur Ctrl+C pour arreter l'application
echo.

npm run dev
