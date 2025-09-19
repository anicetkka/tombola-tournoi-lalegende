const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tombola_cote_ivoire', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connexion à MongoDB réussie');

    // Vérifier si un admin existe déjà
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️ Un administrateur existe déjà:', existingAdmin.phone);
      process.exit(0);
    }

    // Créer l'administrateur
    const adminData = {
      phone: '+2250000000000',
      fullName: 'ADMINISTRATEUR',
      password: 'Admin123!',
      role: 'admin',
      isActive: true
    };

    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Administrateur créé avec succès !');
    console.log('📱 Téléphone:', adminData.phone);
    console.log('🔑 Mot de passe:', adminData.password);
    console.log('⚠️ Changez le mot de passe après la première connexion !');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Exécuter le script
createAdmin();

