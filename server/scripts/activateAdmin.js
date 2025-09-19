const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const activateAdmin = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tombola_cote_ivoire', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connexion à MongoDB réussie');

    // Trouver l'administrateur
    const adminPhone = process.env.ADMIN_PHONE || '+2250000000000';
    const admin = await User.findOne({ phone: adminPhone });

    if (!admin) {
      console.error('❌ Administrateur non trouvé avec le numéro:', adminPhone);
      mongoose.connection.close();
      process.exit(1);
    }

    console.log(`🔍 Administrateur trouvé: ${admin.fullName} (${admin.phone})`);
    console.log(`📊 Statut actuel: ${admin.isActive ? 'Actif' : 'Inactif'}`);

    if (admin.isActive) {
      console.log('✅ L\'administrateur est déjà actif');
    } else {
      // Activer l'administrateur
      admin.isActive = true;
      await admin.save();
      console.log('🎉 Administrateur activé avec succès !');
    }

    console.log('📋 Informations de l\'administrateur:');
    console.log(`   - Nom: ${admin.fullName}`);
    console.log(`   - Téléphone: ${admin.phone}`);
    console.log(`   - Rôle: ${admin.role}`);
    console.log(`   - Statut: ${admin.isActive ? 'Actif' : 'Inactif'}`);
    console.log(`   - Créé le: ${admin.createdAt}`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'activation de l\'administrateur:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Exécuter le script
activateAdmin();
