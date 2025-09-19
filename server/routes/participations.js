const express = require('express');
const Participation = require('../models/Participation');
const Tombola = require('../models/Tombola');
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateParticipation, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// Route pour créer une participation
router.post('/', authenticateToken, validateParticipation, async (req, res) => {
  try {
    const { tombolaId, transactionId, paymentPhone, paymentMethod, amount } = req.body;
    
    // Vérifier que la tombola existe et est active
    const tombola = await Tombola.findById(tombolaId);
    if (!tombola) {
      return res.status(404).json({
        error: 'Tombola non trouvée',
        message: 'Aucune tombola trouvée avec cet ID'
      });
    }
    
    if (!tombola.isActive()) {
      return res.status(400).json({
        error: 'Tombola non active',
        message: 'Cette tombola n\'est plus active'
      });
    }
    
    // Vérifier le montant
    if (amount !== tombola.participationPrice) {
      return res.status(400).json({
        error: 'Montant incorrect',
        message: `Le montant doit être de ${tombola.participationPrice} FCFA`
      });
    }
    
    // Vérifier la limite de participants
    if (tombola.maxParticipants && tombola.totalParticipations >= tombola.maxParticipants) {
      return res.status(400).json({
        error: 'Tombola complète',
        message: 'Le nombre maximum de participants a été atteint'
      });
    }
    
    // Vérifier si cette transaction n'a pas déjà été utilisée
    const existingParticipation = await Participation.findOne({
      transactionId: transactionId.toUpperCase(),
      tombolaId
    });
    
    if (existingParticipation) {
      return res.status(400).json({
        error: 'Transaction déjà utilisée',
        message: 'Cette transaction a déjà été utilisée pour cette tombola'
      });
    }
    
    // Générer un numéro de participation unique
    const participationNumber = await Participation.generateParticipationNumber();
    
    // Créer la participation
    const participation = new Participation({
      participationNumber,
      userId: req.user._id,
      tombolaId,
      transactionId: transactionId.toUpperCase(),
      paymentPhone,
      paymentMethod,
      amount
    });
    
    await participation.save();
    
    // Populer les données pour la réponse
    await participation.populate('tombolaId', 'title prizeAmount participationPrice endDate');
    
    res.status(201).json({
      message: 'Participation soumise avec succès',
      participation: participation.toPublicJSON(),
      instructions: {
        status: 'En attente de validation',
        message: 'Votre participation est en cours de validation par l\'administrateur. Vous recevrez une confirmation dans les 24-48h.',
        nextSteps: [
          '1. Vérifiez que votre paiement a bien été effectué',
          '2. Attendez la validation de l\'administrateur',
          '3. Consultez votre profil pour suivre le statut'
        ]
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la création de la participation:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la soumission de la participation'
    });
  }
});

// Route pour obtenir les participations de l'utilisateur connecté
router.get('/my-participations', authenticateToken, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
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

// Route pour obtenir une participation spécifique
router.get('/:id', authenticateToken, validateObjectId, async (req, res) => {
  try {
    const participation = await Participation.findById(req.params.id)
      .populate('tombolaId', 'title prizeAmount participationPrice endDate status isDrawn')
      .populate('userId', 'fullName phone');
    
    if (!participation) {
      return res.status(404).json({
        error: 'Participation non trouvée',
        message: 'Aucune participation trouvée avec cet ID'
      });
    }
    
    // Vérifier que l'utilisateur peut accéder à cette participation
    if (req.user.role !== 'admin' && participation.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous ne pouvez accéder qu\'à vos propres participations'
      });
    }
    
    res.json({
      participation: req.user.role === 'admin' 
        ? participation.toAdminJSON() 
        : participation.toPublicJSON()
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération de la participation:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la récupération de la participation'
    });
  }
});

// Route pour obtenir toutes les participations (admin seulement)
router.get('/', authenticateToken, requireAdmin, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Filtrer par statut si spécifié
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Filtrer par tombola si spécifié
    if (req.query.tombolaId) {
      filter.tombolaId = req.query.tombolaId;
    }
    
    // Filtrer par utilisateur si spécifié
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    
    const participations = await Participation.find(filter)
      .populate('userId', 'fullName phone')
      .populate('tombolaId', 'title prizeAmount participationPrice endDate')
      .populate('validatedBy', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Participation.countDocuments(filter);
    
    res.json({
      participations: participations.map(p => p.toAdminJSON()),
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

// Route pour valider ou rejeter une participation (admin seulement)
router.put('/:id/validate', authenticateToken, requireAdmin, validateObjectId, async (req, res) => {
  try {
    const { action, notes } = req.body;
    
    if (!['validate', 'reject'].includes(action)) {
      return res.status(400).json({
        error: 'Action invalide',
        message: 'L\'action doit être "validate" ou "reject"'
      });
    }
    
    const participation = await Participation.findById(req.params.id)
      .populate('userId', 'fullName phone')
      .populate('tombolaId', 'title');
    
    if (!participation) {
      return res.status(404).json({
        error: 'Participation non trouvée',
        message: 'Aucune participation trouvée avec cet ID'
      });
    }
    
    if (participation.status !== 'pending') {
      return res.status(400).json({
        error: 'Participation déjà traitée',
        message: 'Cette participation a déjà été traitée'
      });
    }
    
    if (action === 'validate') {
      await participation.validateParticipation(req.user._id, notes);
      
      // Mettre à jour le compteur de participations de l'utilisateur
      const user = await User.findById(participation.userId._id);
      if (user) {
        await user.updateParticipationCount(participation.tombolaId._id);
      }
      
      res.json({
        message: 'Participation validée avec succès',
        participation: participation.toAdminJSON()
      });
    } else {
      await participation.reject(req.user._id, notes);
      
      res.json({
        message: 'Participation rejetée',
        participation: participation.toAdminJSON()
      });
    }
    
  } catch (error) {
    console.error('Erreur lors de la validation:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la validation de la participation'
    });
  }
});

// Route pour obtenir les statistiques des participations (admin seulement)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await Participation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    const paymentMethodStats = await Participation.aggregate([
      { $match: { status: 'validated' } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    const recentParticipations = await Participation.find()
      .populate('userId', 'fullName phone')
      .populate('tombolaId', 'title')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      statusStats: stats,
      paymentMethodStats,
      recentParticipations: recentParticipations.map(p => p.toAdminJSON())
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
