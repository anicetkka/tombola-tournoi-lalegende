const mongoose = require('mongoose');
const User = require('../models/User');

// Utiliser la même URI que Render
const MONGODB_URI = 'mongodb+srv://tombola-admin:sqXCgnsiWbhjW6tF@tombola.tl56th9.mongodb.net/?retryWrites=true&w=majority&appName=tombola';

async function createAdminProduction() {
  try {
    console.log('🔌 Connexion à MongoDB Atlas (Production)...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion à MongoDB Atlas réussie');

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
        fullName: 'Administrateur Production',
        password: 'Admin123!',
        role: 'admin',
        isActive: true
      });

      await admin.save();
      console.log('✅ Administrateur créé avec succès dans MongoDB Atlas:', admin.phone);
    }

    // Vérifier la création
    const adminCheck = await User.findOne({ phone: '+2250703909441' });
    console.log('\n📋 Vérification de l\'admin:');
    console.log('   📞 Téléphone:', adminCheck.phone);
    console.log('   👤 Nom:', adminCheck.fullName);
    console.log('   🔑 Rôle:', adminCheck.role);
    console.log('   ✅ Actif:', adminCheck.isActive);

    console.log('\n🎯 Identifiants de connexion :');
    console.log('📞 Téléphone: +2250703909441');
    console.log('🔑 Mot de passe: Admin123!');
    console.log('👤 Rôle: admin');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Connexion fermée');
  }
}

createAdminProduction();
