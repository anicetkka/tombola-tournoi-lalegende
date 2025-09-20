@echo off
echo ========================================
echo    PROMOTION EN ADMINISTRATEUR
echo ========================================
echo.

echo 🔧 Promotion de l'utilisateur en administrateur...
echo 📞 Téléphone: +2250123456789
echo 👤 Nom: Admin Principal
echo.

cd server
node scripts/makeUserAdmin.js

echo.
echo ========================================
echo    FIN DU SCRIPT
echo ========================================
pause
