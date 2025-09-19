const mongoose = require('mongoose');
require('dotenv').config();

// Import des modèles
const ContactMessage = require('../models/ContactMessage');

const seedContactMessages = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tombola_cote_ivoire', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connexion à MongoDB réussie');

    // Supprimer les messages existants
    await ContactMessage.deleteMany({});
    console.log('🗑️ Messages de contact existants supprimés');

    // Créer des messages de test
    const testMessages = [
      {
        phone: '+2250701234567',
        message: 'Bonjour, j\'ai oublié mon mot de passe. Pouvez-vous m\'aider à le réinitialiser ?',
        status: 'pending'
      },
      {
        phone: '+2250701234568',
        message: 'Mon compte semble être bloqué. Je ne peux plus me connecter depuis hier.',
        status: 'read'
      },
      {
        phone: '+2250701234569',
        message: 'J\'ai un problème avec ma participation à la tombola. Le statut reste en attente depuis 3 jours.',
        status: 'replied',
        adminResponse: 'Votre participation a été validée. Vous devriez voir le statut mis à jour dans votre profil.'
      },
      {
        phone: '+2250701234570',
        message: 'Comment puis-je récupérer mes gains si je gagne ?',
        status: 'pending'
      },
      {
        phone: '+2250701234571',
        message: 'Je n\'arrive pas à participer à la tombola. Le formulaire ne se soumet pas.',
        status: 'read'
      }
    ];

    // Insérer les messages de test
    const createdMessages = await ContactMessage.insertMany(testMessages);
    console.log(`✅ ${createdMessages.length} messages de contact créés`);

    // Afficher les messages créés
    console.log('\n📋 Messages créés :');
    createdMessages.forEach((msg, index) => {
      console.log(`${index + 1}. ${msg.phone} - ${msg.status} - "${msg.message.substring(0, 50)}..."`);
    });

    console.log('\n🎉 Seeding terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
  }
};

// Exécuter le script
seedContactMessages();
