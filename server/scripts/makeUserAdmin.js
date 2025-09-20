const mongoose = require('mongoose');

// URI de production (MongoDB Atlas)
const MONGODB_URI = 'mongodb+srv://tombola-admin:sqXCgnsiWbhjW6tF@tombola.tl56th9.mongodb.net/?retryWrites=true&w=majority&appName=tombola';

async function makeUserAdmin() {
  try {
    console.log('🔌 Connexion à MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion réussie');

    // Trouver l'utilisateur par son téléphone
    const userPhone = '+2250123456789';
    const User = require('../models/User');
    
    const user = await User.findOne({ phone: userPhone });
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé avec le téléphone:', userPhone);
      return;
    }
    
    console.log('👤 Utilisateur trouvé:');
    console.log('   📞 Téléphone:', user.phone);
    console.log('   👤 Nom:', user.fullName);
    console.log('   🔑 Rôle actuel:', user.role);
    console.log('   ✅ Actif:', user.isActive);
    
    // Modifier le rôle en admin
    user.role = 'admin';
    user.isActive = true;
    
    await user.save();
    
    console.log('\n🎉 Utilisateur promu administrateur !');
    console.log('📋 Nouveau statut:');
    console.log('   📞 Téléphone:', user.phone);
    console.log('   👤 Nom:', user.fullName);
    console.log('   🔑 Rôle:', user.role);
    console.log('   ✅ Actif:', user.isActive);
    
    console.log('\n🎯 Vous pouvez maintenant vous connecter avec:');
    console.log('📞 Téléphone: +2250123456789');
    console.log('🔑 Mot de passe: Admin123!');
    console.log('👤 Rôle: admin');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.message.includes('ETIMEOUT')) {
      console.log('💡 Problème de connexion réseau. Essayez plus tard.');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Connexion fermée');
  }
}

makeUserAdmin();
