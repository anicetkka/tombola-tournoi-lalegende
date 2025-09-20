const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createSpecificAdmin() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tombola_cote_ivoire');
    console.log('✅ Connexion à MongoDB réussie');

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ phone: '+2250703909441' });
    
    if (existingAdmin) {
      console.log('⚠️ Un administrateur existe déjà avec ce numéro:', existingAdmin.phone);
      console.log('🔄 Mise à jour du mot de passe...');
      
      // Mettre à jour le mot de passe
      existingAdmin.password = 'Admin123!';
      existingAdmin.role = 'admin';
      existingAdmin.isActive = true;
      await existingAdmin.save();
      
      console.log('✅ Mot de passe mis à jour pour l\'admin:', existingAdmin.phone);
    } else {
      // Créer un nouvel admin
      const admin = new User({
        phone: '+2250703909441',
        fullName: 'Administrateur',
        password: 'Admin123!',
        role: 'admin',
        isActive: true
      });

      await admin.save();
      console.log('✅ Administrateur créé avec succès:', admin.phone);
    }

    console.log('\n📋 Identifiants de connexion :');
    console.log('📞 Téléphone: +2250703909441');
    console.log('🔑 Mot de passe: Admin123!');
    console.log('👤 Rôle: admin');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion fermée');
  }
}

createSpecificAdmin();
