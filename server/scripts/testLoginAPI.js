const axios = require('axios');

async function testLoginAPI() {
  try {
    console.log('🧪 Test de l\'API de connexion...');
    
    const response = await axios.post('https://tombola-backend-api.onrender.com/api/auth/login', {
      phone: '+2250703909441',
      password: 'Admin123!'
    });
    
    console.log('✅ Connexion réussie !');
    console.log('📋 Réponse:', response.data);
    
  } catch (error) {
    console.error('❌ Erreur de connexion:');
    console.error('   Status:', error.response?.status);
    console.error('   Message:', error.response?.data?.message);
    console.error('   Détails:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('\n🔍 L\'erreur 401 indique que les identifiants sont incorrects.');
      console.log('💡 Solutions possibles:');
      console.log('   1. L\'utilisateur n\'existe pas dans la base de données');
      console.log('   2. Le mot de passe est incorrect');
      console.log('   3. L\'utilisateur n\'est pas actif');
    }
  }
}

testLoginAPI();
