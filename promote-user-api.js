// Script pour promouvoir un utilisateur en admin via l'API
const https = require('https');

async function promoteUser() {
  const data = JSON.stringify({
    phone: '+2250123456789',
    secretKey: 'PROMOTE_ADMIN_2024'
  });

  const options = {
    hostname: 'tombola-backend-api.onrender.com',
    port: 443,
    path: '/api/admin/promote-user',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  console.log('🚀 Promotion de l\'utilisateur en admin via l\'API...');
  console.log('📞 Téléphone: +2250123456789');
  console.log('🔑 Clé secrète: PROMOTE_ADMIN_2024');
  console.log('');

  const req = https.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log('📋 Status:', res.statusCode);
      console.log('📋 Réponse:', responseData);
      
      if (res.statusCode === 200) {
        console.log('🎉 Utilisateur promu administrateur avec succès !');
        console.log('');
        console.log('🎯 Vous pouvez maintenant vous connecter avec:');
        console.log('📞 Téléphone: +2250123456789');
        console.log('🔑 Mot de passe: Admin123!');
        console.log('👤 Rôle: admin');
      } else {
        console.log('❌ Erreur lors de la promotion');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erreur de connexion:', error.message);
  });

  req.write(data);
  req.end();
}

promoteUser();
