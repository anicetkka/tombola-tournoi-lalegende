const axios = require('axios');

async function createAdminViaAPI() {
  try {
    console.log('🚀 Création de l\'admin via l\'API...');
    
    const API_BASE_URL = 'https://tombola-backend-api.onrender.com/api';
    
    // 1. D'abord, essayer de s'inscrire avec le numéro admin
    console.log('📝 Tentative d\'inscription de l\'admin...');
    
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        phone: '+2250703909441',
        fullName: 'Administrateur',
        password: 'Admin123!'
      });
      
      console.log('✅ Inscription réussie !');
      console.log('📋 Réponse:', registerResponse.data);
      
    } catch (registerError) {
      if (registerError.response?.status === 400 && 
          registerError.response?.data?.message?.includes('existe déjà')) {
        console.log('⚠️ L\'utilisateur existe déjà, on continue...');
      } else {
        console.error('❌ Erreur d\'inscription:', registerError.response?.data);
        throw registerError;
      }
    }
    
    // 2. Maintenant, essayer de se connecter
    console.log('\n🔐 Tentative de connexion...');
    
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      phone: '+2250703909441',
      password: 'Admin123!'
    });
    
    console.log('✅ Connexion réussie !');
    console.log('🔑 Token reçu:', loginResponse.data.token ? 'OUI' : 'NON');
    console.log('👤 Utilisateur:', loginResponse.data.user);
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    
    // 3. Vérifier le rôle
    if (user.role === 'admin') {
      console.log('🎉 L\'utilisateur est déjà admin !');
    } else {
      console.log('⚠️ L\'utilisateur n\'est pas admin. Rôle actuel:', user.role);
      console.log('💡 Il faudra modifier le rôle manuellement dans MongoDB Atlas.');
    }
    
    console.log('\n🎯 Identifiants de connexion :');
    console.log('📞 Téléphone: +2250703909441');
    console.log('🔑 Mot de passe: Admin123!');
    console.log('👤 Rôle:', user.role);
    console.log('✅ Actif:', user.isActive);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error('📋 Détails de l\'erreur:', error.response.data);
    }
  }
}

createAdminViaAPI();
