const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Tombola = require('../models/Tombola');
const Participation = require('../models/Participation');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tombola_cote_ivoire', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connexion à MongoDB réussie');

    // Nettoyer la base de données
    await User.deleteMany({});
    await Tombola.deleteMany({});
    await Participation.deleteMany({});

    console.log('🧹 Base de données nettoyée');

    // Créer des utilisateurs de test
    const users = [];
    
    // Utilisateur admin
    const adminUser = new User({
      phone: '+2250000000000',
      fullName: 'ADMINISTRATEUR',
      password: 'Admin123!',
      role: 'admin',
      isActive: true
    });
    await adminUser.save();
    users.push(adminUser);
    console.log('👤 Utilisateur admin créé');

    // Utilisateurs réguliers
    for (let i = 1; i <= 10; i++) {
      const user = new User({
        phone: `+225000000000${i.toString().padStart(1, '0')}`,
        fullName: `UTILISATEUR ${i}`,
        password: 'User123!',
        role: 'user',
        isActive: true
      });
      await user.save();
      users.push(user);
    }
    console.log('👥 10 utilisateurs créés');

    // Créer des tombolas de test
    const tombolas = [];
    
    // Tombola active
    const activeTombola = new Tombola({
      title: 'TOMBOLA SPECIALE NOEL',
      description: 'Participez à notre tombola spéciale de Noël et tentez de gagner une cagnotte de 50 000 FCFA !',
      prizeAmount: 50000,
      participationPrice: 1000,
      maxParticipants: 100,
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours dans le futur
      status: 'active',
      createdBy: adminUser._id
    });
    await activeTombola.save();
    tombolas.push(activeTombola);

    // Tombola terminée
    const endedTombola = new Tombola({
      title: 'TOMBOLA HALLOWEEN',
      description: 'Tombola d\'Halloween avec des lots mystérieux !',
      prizeAmount: 25000,
      participationPrice: 500,
      maxParticipants: 50,
      endDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 jour dans le passé
      status: 'ended',
      createdBy: adminUser._id
    });
    await endedTombola.save();
    tombolas.push(endedTombola);

    console.log('🎯 2 tombolas créées');

    // Créer des participations de test
    const participations = [];
    
    // Participations pour la tombola active
    for (let i = 0; i < 8; i++) {
      const user = users[Math.floor(Math.random() * 10) + 1]; // Utilisateurs réguliers
      const participation = new Participation({
        userId: user._id,
        tombolaId: activeTombola._id,
        transactionId: `TXN${(i + 1).toString().padStart(3, '0')}`,
        paymentPhone: user.phone,
        paymentMethod: Math.random() > 0.5 ? 'wave' : 'orange_money',
        amount: activeTombola.participationPrice,
        status: Math.random() > 0.3 ? 'validated' : 'pending',
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      });
      await participation.save();
      participations.push(participation);
    }

    // Participations pour la tombola terminée
    for (let i = 0; i < 15; i++) {
      const user = users[Math.floor(Math.random() * 10) + 1];
      const participation = new Participation({
        userId: user._id,
        tombolaId: endedTombola._id,
        transactionId: `TXN${(i + 9).toString().padStart(3, '0')}`,
        paymentPhone: user.phone,
        paymentMethod: Math.random() > 0.5 ? 'wave' : 'orange_money',
        amount: endedTombola.participationPrice,
        status: 'validated',
        createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000)
      });
      await participation.save();
      participations.push(participation);
    }

    console.log('🎫 23 participations créées');

    // Mettre à jour les compteurs des tombolas
    for (const tombola of tombolas) {
      const count = await Participation.countDocuments({ tombolaId: tombola._id });
      const revenue = await Participation.aggregate([
        { $match: { tombolaId: tombola._id, status: 'validated' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      
      tombola.totalParticipations = count;
      tombola.totalRevenue = revenue.length > 0 ? revenue[0].total : 0;
      await tombola.save();
    }

    console.log('📊 Compteurs des tombolas mis à jour');

    // Mettre à jour les compteurs des utilisateurs
    for (const user of users) {
      const count = await Participation.countDocuments({ userId: user._id });
      user.totalParticipations = count;
      await user.save();
    }

    console.log('📊 Compteurs des utilisateurs mis à jour');

    console.log('\n🎉 Données de test créées avec succès !');
    console.log('\n📋 Résumé :');
    console.log(`👤 ${users.length} utilisateurs (1 admin + 10 utilisateurs)`);
    console.log(`🎯 ${tombolas.length} tombolas (1 active + 1 terminée)`);
    console.log(`🎫 ${participations.length} participations`);
    console.log('\n🔑 Identifiants de test :');
    console.log('Admin: +2250000000000 / Admin123!');
    console.log('Utilisateur: +2250000000001 / User123!');

  } catch (error) {
    console.error('❌ Erreur lors de la création des données de test:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Exécuter le script
seedData();
