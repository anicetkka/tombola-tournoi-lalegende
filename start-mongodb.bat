@echo off
echo ========================================
echo Demarrage de MongoDB
echo ========================================
echo.

echo Recherche de MongoDB...

set MONGODB_PATH=

:: Recherche dans Program Files
if exist "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files\MongoDB\Server\8.0\bin
    echo ✅ MongoDB 8.0 trouve
    goto :start
)

if exist "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files\MongoDB\Server\6.0\bin
    echo ✅ MongoDB 6.0 trouve
    goto :start
)

if exist "C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files\MongoDB\Server\5.0\bin
    echo ✅ MongoDB 5.0 trouve
    goto :start
)

:: Recherche dans Program Files (x86)
if exist "C:\Program Files (x86)\MongoDB\Server\8.0\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files (x86)\MongoDB\Server\8.0\bin
    echo ✅ MongoDB 7.0 trouve (x86)
    goto :start
)

if exist "C:\Program Files (x86)\MongoDB\Server\6.0\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files (x86)\MongoDB\Server\6.0\bin
    echo ✅ MongoDB 6.0 trouve (x86)
    goto :start
)

if exist "C:\Program Files (x86)\MongoDB\Server\5.0\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files (x86)\MongoDB\Server\5.0\bin
    echo ✅ MongoDB 5.0 trouve (x86)
    goto :start
)

echo ❌ MongoDB non trouve !
echo.
echo Veuillez installer MongoDB depuis : https://www.mongodb.com/try/download/community
echo.
pause
exit /b 1

:start
echo.
echo Chemin MongoDB : %MONGODB_PATH%
echo.

echo Creation du dossier de donnees...
if not exist "C:\data\db" mkdir "C:\data\db"

echo Demarrage de MongoDB...
echo.
echo MongoDB va demarrer sur le port 27017
echo Appuyez sur Ctrl+C pour arreter MongoDB
echo.

"%MONGODB_PATH%\mongod.exe" --dbpath "C:\data\db"
