const express = require('express');
const User = require('../models/User');
const Participation = require('../models/Participation');
const { authenticateToken, requireOwnership } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// Route pour obtenir le profil de l'utilisateur connecté
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Obtenir les participations récentes
    const recentParticipations = await Participation.find({ userId: user._id })
      .populate('tombolaId', 'title prizeAmount participationPrice endDate status isDrawn')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Obtenir les statistiques de participation
    const participationStats = await Participation.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    // Obtenir les participations par tombola
    const participationsByTombola = await Participation.aggregate([
      { $match: { userId: user._id, status: 'validated' } },
      {
        $group: {
          _id: '$tombolaId',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $lookup: {
          from: 'tombolas',
          localField: '_id',
          foreignField: '_id',
          as: 'tombola'
        }
      },
      { $unwind: '$tombola' }
    ]);
    
    res.json({
      user: user.toPublicJSON(),
      stats: {
        participationStats,
        participationsByTombola: participationsByTombola.map(p => ({
          tombola: {
            id: p.tombola._id,
            title: p.tombola.title,
            prizeAmount: p.tombola.prizeAmount,
            endDate: p.tombola.endDate,
            status: p.tombola.status,
            isDrawn: p.tombola.isDrawn
          },
          participationCount: p.count,
          totalAmount: p.totalAmount
        }))
      },
      recentParticipations: recentParticipations.map(p => ({
        ...p.toPublicJSON(),
        tombola: p.tombolaId
      }))
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la récupération du profil'
    });
  }
});

// Route pour mettre à jour le profil utilisateur
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName } = req.body;
    
    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({
        error: 'Nom invalide',
        message: 'Le nom doit contenir au moins 2 caractères'
      });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'Utilisateur non trouvé'
      });
    }
    
    user.fullName = fullName.toUpperCase(); // Formatage en majuscules
    await user.save();
    
    res.json({
      message: 'Profil mis à jour avec succès',
      user: user.toPublicJSON()
    });
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la mise à jour du profil'
    });
  }
});

// Route pour changer le mot de passe
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'Le mot de passe actuel et le nouveau mot de passe sont requis'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Mot de passe invalide',
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
      });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Mot de passe incorrect',
        message: 'Le mot de passe actuel est incorrect'
      });
    }
    
    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();
    
    res.json({
      message: 'Mot de passe modifié avec succès'
    });
    
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors du changement de mot de passe'
    });
  }
});

// Route pour obtenir l'historique complet des participations
router.get('/participations', authenticateToken, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filter = { userId: req.user._id };
    
    // Filtrer par statut si spécifié
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Filtrer par tombola si spécifié
    if (req.query.tombolaId) {
      filter.tombolaId = req.query.tombolaId;
    }
    
    const participations = await Participation.find(filter)
      .populate('tombolaId', 'title prizeAmount participationPrice endDate status isDrawn')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Participation.countDocuments(filter);
    
    res.json({
      participations: participations.map(p => ({
        ...p.toPublicJSON(),
        tombola: p.tombolaId
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des participations:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la récupération des participations'
    });
  }
});

// Route pour obtenir les critères de participation
router.get('/participation-criteria', authenticateToken, async (req, res) => {
  try {
    const criteria = {
      steps: [
        {
          step: 1,
          title: "Effectuez le paiement",
          description: "Déposez le montant de participation sur le compte Wave ou Orange Money indiqué",
          details: [
            "Compte Wave: +225 01 234 5678",
            "Compte Orange Money: +225 01 234 5678",
            "Montant exact requis selon la tombola"
          ]
        },
        {
          step: 2,
          title: "Soumettez votre participation",
          description: "Remplissez le formulaire avec les détails de votre transaction",
          details: [
            "ID de transaction (fourni par Wave/Orange Money)",
            "Numéro de téléphone utilisé pour le paiement",
            "Nom et prénom",
            "Tombola sélectionnée"
          ]
        },
        {
          step: 3,
          title: "Attendez la validation",
          description: "L'administrateur vérifiera votre paiement et validera votre participation",
          details: [
            "Délai de validation: 24-48h maximum",
            "Statut: 'En attente' → 'Participation validée'",
            "Confirmation par email/SMS"
          ]
        },
        {
          step: 4,
          title: "Suivez le tirage",
          description: "Après la date de fin, l'administrateur effectuera le tirage au sort",
          details: [
            "Tirage manuel par l'administrateur",
            "Statut final: 'Tombola validée'",
            "Résultat: Gagnant ou Non gagnant"
          ]
        }
      ],
      importantNotes: [
        "Chaque participation validée compte comme une entrée",
        "Un utilisateur peut participer plusieurs fois à la même tombola",
        "Le tirage est effectué de manière aléatoire et sécurisée",
        "Les gagnants sont contactés directement pour le versement"
      ],
      contactInfo: {
        phone: "+225 01 234 5678",
        email: "support@tombola-ci.com",
        hours: "Lundi - Vendredi: 8h - 18h"
      }
    };
    
    res.json(criteria);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des critères:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la récupération des critères'
    });
  }
});

// Route pour obtenir les statistiques personnelles
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Statistiques générales
    const totalParticipations = await Participation.countDocuments({ userId });
    const validatedParticipations = await Participation.countDocuments({ 
      userId, 
      status: 'validated' 
    });
    const wonParticipations = await Participation.countDocuments({ 
      userId, 
      isWinner: true 
    });
    
    // Montant total investi
    const totalInvested = await Participation.aggregate([
      { $match: { userId, status: 'validated' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    // Participations par mois (6 derniers mois)
    const monthlyStats = await Participation.aggregate([
      { $match: { userId, status: 'validated' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);
    
    // Tombolas les plus participées
    const topTombolas = await Participation.aggregate([
      { $match: { userId, status: 'validated' } },
      {
        $group: {
          _id: '$tombolaId',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'tombolas',
          localField: '_id',
          foreignField: '_id',
          as: 'tombola'
        }
      },
      { $unwind: '$tombola' }
    ]);
    
    res.json({
      overview: {
        totalParticipations,
        validatedParticipations,
        wonParticipations,
        totalInvested: totalInvested[0]?.total || 0,
        winRate: validatedParticipations > 0 ? (wonParticipations / validatedParticipations * 100).toFixed(2) : 0
      },
      monthlyStats: monthlyStats.map(stat => ({
        month: stat._id.month,
        year: stat._id.year,
        count: stat.count,
        amount: stat.amount
      })),
      topTombolas: topTombolas.map(stat => ({
        tombola: {
          id: stat.tombola._id,
          title: stat.tombola.title,
          prizeAmount: stat.tombola.prizeAmount
        },
        participationCount: stat.count,
        totalAmount: stat.totalAmount
      }))
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
});

module.exports = router;
