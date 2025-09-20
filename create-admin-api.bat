@echo off
echo ========================================
echo    CREATION ADMIN VIA API
echo ========================================
echo.

echo 🚀 Création de l'admin via l'API de l'application...
echo 📞 Téléphone admin: +2250703909441
echo 🔑 Mot de passe: Admin123!
echo.

cd server
node scripts/createAdminViaAPI.js

echo.
echo ========================================
echo    FIN DU SCRIPT
echo ========================================
pause
