const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function checkUsers() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tombola_cote_ivoire');
    console.log('✅ Connexion à MongoDB réussie');

    // Récupérer tous les utilisateurs
    const users = await User.find({});
    
    console.log('\n📋 Utilisateurs dans la base de données :');
    console.log('=====================================');
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. Utilisateur:`);
      console.log(`   📞 Téléphone: ${user.phone}`);
      console.log(`   👤 Nom: ${user.fullName}`);
      console.log(`   🔑 Rôle: ${user.role}`);
      console.log(`   ✅ Actif: ${user.isActive}`);
      console.log(`   📅 Créé: ${user.createdAt}`);
    });
    
    console.log(`\n📊 Total: ${users.length} utilisateur(s)`);
    
    // Vérifier spécifiquement l'admin
    const admin = await User.findOne({ phone: '+2250703909441' });
    if (admin) {
      console.log('\n✅ Admin trouvé:');
      console.log(`   📞 Téléphone: ${admin.phone}`);
      console.log(`   👤 Nom: ${admin.fullName}`);
      console.log(`   🔑 Rôle: ${admin.role}`);
      console.log(`   ✅ Actif: ${admin.isActive}`);
    } else {
      console.log('\n❌ Admin avec le numéro +2250703909441 non trouvé');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Connexion fermée');
  }
}

checkUsers();
