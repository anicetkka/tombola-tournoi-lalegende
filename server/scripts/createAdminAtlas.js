const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// URI de production (MongoDB Atlas)
const MONGODB_URI = 'mongodb+srv://tombola-admin:sqXCgnsiWbhjW6tF@tombola.tl56th9.mongodb.net/?retryWrites=true&w=majority&appName=tombola';

async function createAdminAtlas() {
  try {
    console.log('🔌 Connexion à MongoDB Atlas (Production)...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion à MongoDB Atlas réussie');

    const adminPhone = '+2250703909441';
    const adminPassword = 'Admin123!';

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ phone: adminPhone });
    
    if (existingAdmin) {
      console.log('⚠️ Un administrateur existe déjà avec ce numéro:', existingAdmin.phone);
      console.log('🔄 Mise à jour du rôle et activation...');
      
      // Mettre à jour pour être admin
      existingAdmin.role = 'admin';
      existingAdmin.isActive = true;
      existingAdmin.fullName = 'Administrateur';
      
      // Mettre à jour le mot de passe
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      existingAdmin.password = hashedPassword;
      
      await existingAdmin.save();
      console.log('✅ Administrateur mis à jour:', existingAdmin.phone);
    } else {
      console.log('🆕 Création d\'un nouvel administrateur...');
      
      // Créer un nouvel admin
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      const admin = new User({
        phone: adminPhone,
        fullName: 'Administrateur',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });

      await admin.save();
      console.log('✅ Administrateur créé avec succès:', admin.phone);
    }

    // Vérifier la création
    const adminCheck = await User.findOne({ phone: adminPhone });
    console.log('\n📋 Vérification de l\'admin:');
    console.log('   📞 Téléphone:', adminCheck.phone);
    console.log('   👤 Nom:', adminCheck.fullName);
    console.log('   🔑 Rôle:', adminCheck.role);
    console.log('   ✅ Actif:', adminCheck.isActive);
    console.log('   📅 Créé:', adminCheck.createdAt);

    console.log('\n🎯 Identifiants de connexion :');
    console.log('📞 Téléphone: +2250703909441');
    console.log('🔑 Mot de passe: Admin123!');
    console.log('👤 Rôle: admin');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.message.includes('ETIMEOUT')) {
      console.log('💡 Problème de connexion réseau. Essayez:');
      console.log('   1. Vérifiez votre connexion internet');
      console.log('   2. Attendez quelques minutes et réessayez');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Connexion fermée');
  }
}

createAdminAtlas();
