const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Tombola = require('../models/Tombola');
const Participation = require('../models/Participation');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// Toutes les routes admin nécessitent une authentification et des droits admin
router.use(authenticateToken);
router.use(requireAdmin);

// Route pour obtenir le tableau de bord admin
router.get('/dashboard', async (req, res) => {
  try {
    // Statistiques générales
    const totalUsers = await User.countDocuments();
    const totalTombolas = await Tombola.countDocuments();
    const totalParticipations = await Participation.countDocuments();
    
    // Statistiques des participations par statut
    const participationStats = await Participation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    // Revenus totaux
    const totalRevenue = await Participation.aggregate([
      { $match: { status: 'validated' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    // Tombolas récentes
    const recentTombolas = await Tombola.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'fullName');
    
    // Participations en attente
    const pendingParticipations = await Participation.find({ status: 'pending' })
      .populate('userId', 'fullName phone')
      .populate('tombolaId', 'title')
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Tombolas prêtes pour le tirage
    const readyForDraw = await Tombola.find({
      status: 'active',
      endDate: { $lte: new Date() },
      isDrawn: false,
      totalParticipations: { $gt: 0 }
    }).sort({ endDate: 1 });
    
    res.json({
      stats: {
        totalUsers,
        totalTombolas,
        totalParticipations,
        totalRevenue: totalRevenue[0]?.total || 0,
        participationStats
      },
      recentTombolas: recentTombolas.map(t => t.toPublicJSON()),
      pendingParticipations: pendingParticipations.map(p => p.toAdminJSON()),
      readyForDraw: readyForDraw.map(t => t.toPublicJSON())
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération du tableau de bord:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la récupération du tableau de bord'
    });
  }
});

// Route pour gérer les utilisateurs
router.get('/users', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Filtrer par rôle si spécifié
    if (req.query.role) {
      filter.role = req.query.role;
    }
    
    // Filtrer par statut actif si spécifié
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments(filter);
    
    res.json({
      users: users.map(user => user.toPublicJSON()),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la récupération des utilisateurs'
    });
  }
});

// Route pour activer/désactiver un utilisateur
router.put('/users/:id/status', validateObjectId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'Aucun utilisateur trouvé avec cet ID'
      });
    }
    
    const { isActive } = req.body;
    
    // Empêcher la désactivation de son propre compte
    if (user._id.toString() === req.user._id.toString() && isActive === false) {
      return res.status(400).json({
        error: 'Action non autorisée',
        message: 'Vous ne pouvez pas désactiver votre propre compte'
      });
    }
    
    user.isActive = isActive;
    await user.save();
    
    res.json({
      message: `Utilisateur ${user.isActive ? 'activé' : 'désactivé'} avec succès`,
      user: user.toPublicJSON()
    });
    
  } catch (error) {
    console.error('Erreur lors de la modification du statut:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la modification du statut'
    });
  }
});

// Route pour réinitialiser le mot de passe d'un utilisateur
router.put('/users/:id/reset-password', validateObjectId, async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        error: 'Mot de passe invalide',
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'Aucun utilisateur trouvé avec cet ID'
      });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({
      message: 'Mot de passe réinitialisé avec succès',
      user: {
        id: user._id,
        phone: user.phone,
        fullName: user.fullName
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la réinitialisation du mot de passe'
    });
  }
});

// Route pour obtenir les statistiques détaillées
router.get('/stats/detailed', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchFilter = {};
    if (startDate || endDate) {
      matchFilter.createdAt = {};
      if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
      if (endDate) matchFilter.createdAt.$lte = new Date(endDate);
    }
    
    // Statistiques des utilisateurs
    const userStats = await User.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: ['$isActive', 1, 0] }
          },
          adminUsers: {
            $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
          }
        }
      }
    ]);
    
    // Statistiques des tombolas
    const tombolaStats = await Tombola.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalPrizeAmount: { $sum: '$prizeAmount' },
          totalRevenue: { $sum: '$totalRevenue' }
        }
      }
    ]);
    
    // Statistiques des participations par mois
    const monthlyStats = await Participation.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Top utilisateurs par participations
    const topUsers = await Participation.aggregate([
      { $match: { status: 'validated' } },
      {
        $group: {
          _id: '$userId',
          participationCount: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { participationCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' }
    ]);
    
    res.json({
      userStats: userStats[0] || { totalUsers: 0, activeUsers: 0, adminUsers: 0 },
      tombolaStats,
      monthlyStats,
      topUsers: topUsers.map(u => ({
        user: {
          id: u.user._id,
          fullName: u.user.fullName,
          phone: u.user.phone
        },
        participationCount: u.participationCount,
        totalAmount: u.totalAmount
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

// Route pour exporter les données (format simplifié)
router.get('/export/participations', async (req, res) => {
  try {
    const { tombolaId, status, startDate, endDate } = req.query;
    
    const filter = {};
    if (tombolaId) filter.tombolaId = tombolaId;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    const participations = await Participation.find(filter)
      .populate('userId', 'fullName phone')
      .populate('tombolaId', 'title')
      .populate('validatedBy', 'fullName')
      .sort({ createdAt: -1 });
    
    const exportData = participations.map(p => ({
      id: p._id,
      utilisateur: p.userId.fullName,
      telephone: p.userId.phone,
      tombola: p.tombolaId.title,
      transactionId: p.transactionId,
      methodePaiement: p.paymentMethod,
      montant: p.amount,
      statut: p.status,
      dateCreation: p.createdAt,
      dateValidation: p.validatedAt,
      validePar: p.validatedBy?.fullName || '',
      notes: p.validationNotes || '',
      gagnant: p.isWinner
    }));
    
    res.json({
      data: exportData,
      count: exportData.length,
      exportedAt: new Date()
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'export:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de l\'export des données'
    });
  }
});

// Route pour réinitialiser le mot de passe d'un utilisateur
router.put('/users/:id/reset-password', validateObjectId, async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        error: 'Mot de passe invalide',
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'Aucun utilisateur trouvé avec cet ID'
      });
    }
    
    // Hasher le nouveau mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Mettre à jour le mot de passe
    user.password = hashedPassword;
    await user.save();
    
    res.json({
      success: true,
      message: `Mot de passe réinitialisé avec succès pour ${user.fullName}`,
      user: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la réinitialisation du mot de passe'
    });
  }
});

// Route pour trouver un utilisateur par numéro de téléphone
router.get('/users/find-by-phone/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    
    // Valider le format du numéro
    if (!/^\+225[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        error: 'Format invalide',
        message: 'Format de numéro ivoirien invalide (+225XXXXXXXXXX)'
      });
    }
    
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'Aucun utilisateur trouvé avec ce numéro de téléphone'
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la recherche d\'utilisateur:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la recherche d\'utilisateur'
    });
  }
});

module.exports = router;
