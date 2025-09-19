@echo off
echo ========================================
echo Recherche de MongoDB
echo ========================================
echo.

echo Recherche de MongoDB dans les emplacements standards...

set MONGODB_PATH=

:: Recherche dans Program Files
if exist "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files\MongoDB\Server\7.0\bin
    echo ✅ MongoDB 7.0 trouve dans Program Files
    goto :found
)

if exist "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files\MongoDB\Server\6.0\bin
    echo ✅ MongoDB 6.0 trouve dans Program Files
    goto :found
)

if exist "C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files\MongoDB\Server\5.0\bin
    echo ✅ MongoDB 5.0 trouve dans Program Files
    goto :found
)

:: Recherche dans Program Files (x86)
if exist "C:\Program Files (x86)\MongoDB\Server\7.0\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files (x86)\MongoDB\Server\7.0\bin
    echo ✅ MongoDB 7.0 trouve dans Program Files (x86)
    goto :found
)

if exist "C:\Program Files (x86)\MongoDB\Server\6.0\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files (x86)\MongoDB\Server\6.0\bin
    echo ✅ MongoDB 6.0 trouve dans Program Files (x86)
    goto :found
)

if exist "C:\Program Files (x86)\MongoDB\Server\5.0\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files (x86)\MongoDB\Server\5.0\bin
    echo ✅ MongoDB 5.0 trouve dans Program Files (x86)
    goto :found
)

:: Recherche dans d'autres emplacements
for /d %%i in ("C:\Program Files\MongoDB\Server\*") do (
    if exist "%%i\bin\mongod.exe" (
        set MONGODB_PATH=%%i\bin
        echo ✅ MongoDB trouve dans %%i\bin
        goto :found
    )
)

echo ❌ MongoDB non trouve dans les emplacements standards
echo.
echo Veuillez installer MongoDB depuis : https://www.mongodb.com/try/download/community
echo.
pause
exit /b 1

:found
echo.
echo ========================================
echo MongoDB trouve !
echo ========================================
echo.
echo Chemin : %MONGODB_PATH%
echo.

echo Ajout temporaire au PATH...
set PATH=%PATH%;%MONGODB_PATH%

echo Test de MongoDB...
"%MONGODB_PATH%\mongod.exe" --version
if %errorlevel% neq 0 (
    echo ❌ Erreur lors du test de MongoDB
    pause
    exit /b 1
)

echo.
echo ✅ MongoDB fonctionne correctement !
echo.
echo Pour ajouter definitivement au PATH :
echo 1. Ouvrez les Parametres systeme (sysdm.cpl)
echo 2. Variables d'environnement
echo 3. Ajoutez : %MONGODB_PATH%
echo.
echo Ou utilisez ce script pour demarrer MongoDB :
echo "%MONGODB_PATH%\mongod.exe" --dbpath "C:\data\db"
echo.
pause
