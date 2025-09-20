@echo off
echo ========================================
echo    CREATION ADMIN DANS MONGODB ATLAS
echo ========================================
echo.

echo 🔌 Connexion à MongoDB Atlas (Production)...
echo 📞 Téléphone admin: +2250703909441
echo 🔑 Mot de passe: Admin123!
echo.

cd server
node scripts/createAdminAtlas.js

echo.
echo ========================================
echo    FIN DU SCRIPT
echo ========================================
pause
