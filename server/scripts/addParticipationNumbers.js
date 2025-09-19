const mongoose = require('mongoose');
const Participation = require('../models/Participation');
require('dotenv').config();

const addParticipationNumbers = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tombola_cote_ivoire', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connexion à MongoDB réussie');

    // Trouver toutes les participations sans numéro
    const participations = await Participation.find({ participationNumber: { $exists: false } });
    
    console.log(`🔍 ${participations.length} participations trouvées sans numéro`);

    if (participations.length === 0) {
      console.log('✅ Toutes les participations ont déjà un numéro');
      mongoose.connection.close();
      process.exit(0);
    }

    // Ajouter un numéro à chaque participation
    for (let i = 0; i < participations.length; i++) {
      const participation = participations[i];
      
      // Générer un numéro unique
      const participationNumber = await Participation.generateParticipationNumber();
      
      // Mettre à jour la participation
      participation.participationNumber = participationNumber;
      await participation.save();
      
      console.log(`✅ Participation ${i + 1}/${participations.length} mise à jour: ${participationNumber}`);
    }

    console.log('🎉 Tous les numéros de participation ont été ajoutés avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des numéros de participation:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Exécuter le script
addParticipationNumbers();
