const mongoose = require('mongoose');
const User = require('../models/User');
const Participation = require('../models/Participation');
require('dotenv').config();

const fixPhoneNumbers = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tombola_cote_ivoire', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connexion à MongoDB réussie');

    // Corriger les numéros des utilisateurs
    console.log('🔧 Correction des numéros de téléphone des utilisateurs...');
    const users = await User.find({});
    
    for (const user of users) {
      if (user.phone && user.phone.length === 12) { // +225XXXXXXXX (8 chiffres)
        const newPhone = user.phone + '00'; // Ajouter 00 pour faire 10 chiffres
        console.log(`Correction: ${user.phone} → ${newPhone}`);
        user.phone = newPhone;
        await user.save();
      }
    }

    // Corriger les numéros des participations
    console.log('🔧 Correction des numéros de téléphone des participations...');
    const participations = await Participation.find({});
    
    for (const participation of participations) {
      if (participation.paymentPhone && participation.paymentPhone.length === 12) { // +225XXXXXXXX (8 chiffres)
        const newPhone = participation.paymentPhone + '00'; // Ajouter 00 pour faire 10 chiffres
        console.log(`Correction: ${participation.paymentPhone} → ${newPhone}`);
        participation.paymentPhone = newPhone;
        await participation.save();
      }
    }

    console.log('✅ Correction terminée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Exécuter le script
fixPhoneNumbers();
