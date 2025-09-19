const express = require('express');
const Tombola = require('../models/Tombola');
const Participation = require('../models/Participation');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateTombola, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// Route pour obtenir toutes les tombolas (publiques)
router.get('/', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Filtrer par statut si spécifié
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Filtrer les tombolas actives par défaut pour les utilisateurs non connectés
    if (!req.headers.authorization) {
      filter.status = 'active';
    }
    
    const tombolas = await Tombola.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'fullName phone');
    
    const total = await Tombola.countDocuments(filter);
    
    res.json({
      tombolas: tombolas.map(tombola => tombola.toPublicJSON()),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des tombolas:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la récupération des tombolas'
    });
  }
});

// Route pour obtenir une tombola spécifique
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const tombola = await Tombola.findById(req.params.id)
      .populate('createdBy', 'fullName phone')
      .populate('winnerId', 'userId transactionId');
    
    if (!tombola) {
      return res.status(404).json({
        error: 'Tombola non trouvée',
        message: 'Aucune tombola trouvée avec cet ID'
      });
    }
    
    res.json({
      tombola: tombola.toPublicJSON()
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération de la tombola:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la récupération de la tombola'
    });
  }
});

// Route pour créer une tombola (admin seulement)
router.post('/', authenticateToken, requireAdmin, validateTombola, async (req, res) => {
  try {
    const { title, description, prizeAmount, participationPrice, maxParticipants, endDate } = req.body;
    
    const tombola = new Tombola({
      title: title.toUpperCase(), // Formatage en majuscules
      description,
      prizeAmount,
      participationPrice,
      maxParticipants,
      endDate: new Date(endDate),
      createdBy: req.user._id
    });
    
    await tombola.save();
    
    res.status(201).json({
      message: 'Tombola créée avec succès',
      tombola: tombola.toPublicJSON()
    });
    
  } catch (error) {
    console.error('Erreur lors de la création de la tombola:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la création de la tombola'
    });
  }
});

// Route pour modifier une tombola (admin seulement)
router.put('/:id', authenticateToken, requireAdmin, validateObjectId, validateTombola, async (req, res) => {
  try {
    const { title, description, prizeAmount, participationPrice, maxParticipants, endDate } = req.body;
    
    const tombola = await Tombola.findById(req.params.id);
    if (!tombola) {
      return res.status(404).json({
        error: 'Tombola non trouvée',
        message: 'Aucune tombola trouvée avec cet ID'
      });
    }
    
    // Vérifier si la tombola peut être modifiée
    if (tombola.isDrawn) {
      return res.status(400).json({
        error: 'Tombola non modifiable',
        message: 'Une tombola déjà tirée ne peut pas être modifiée'
      });
    }
    
    // Mettre à jour les champs
    tombola.title = title.toUpperCase();
    tombola.description = description;
    tombola.prizeAmount = prizeAmount;
    tombola.participationPrice = participationPrice;
    tombola.maxParticipants = maxParticipants;
    tombola.endDate = new Date(endDate);
    
    await tombola.save();
    
    res.json({
      message: 'Tombola mise à jour avec succès',
      tombola: tombola.toPublicJSON()
    });
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tombola:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la mise à jour de la tombola'
    });
  }
});

// Route pour supprimer une tombola (admin seulement)
router.delete('/:id', authenticateToken, requireAdmin, validateObjectId, async (req, res) => {
  try {
    const tombola = await Tombola.findById(req.params.id);
    if (!tombola) {
      return res.status(404).json({
        error: 'Tombola non trouvée',
        message: 'Aucune tombola trouvée avec cet ID'
      });
    }
    
    // Vérifier si la tombola peut être supprimée
    if (tombola.totalParticipations > 0) {
      return res.status(400).json({
        error: 'Tombola non supprimable',
        message: 'Une tombola avec des participations ne peut pas être supprimée'
      });
    }
    
    await Tombola.findByIdAndDelete(req.params.id);
    
    res.json({
      message: 'Tombola supprimée avec succès'
    });
    
  } catch (error) {
    console.error('Erreur lors de la suppression de la tombola:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la suppression de la tombola'
    });
  }
});

// Route pour effectuer le tirage au sort (admin seulement)
router.post('/:id/draw', authenticateToken, requireAdmin, validateObjectId, async (req, res) => {
  try {
    const tombola = await Tombola.findById(req.params.id);
    if (!tombola) {
      return res.status(404).json({
        error: 'Tombola non trouvée',
        message: 'Aucune tombola trouvée avec cet ID'
      });
    }
    
    // Vérifier si la tombola peut être tirée
    if (!tombola.canBeDrawn()) {
      return res.status(400).json({
        error: 'Tirage impossible',
        message: 'Cette tombola ne peut pas être tirée actuellement'
      });
    }
    
    // Effectuer le tirage
    await tombola.performDraw();
    
    // Récupérer les informations du gagnant
    const winnerParticipation = await Participation.findById(tombola.winnerId)
      .populate('userId', 'fullName phone');
    
    res.json({
      message: 'Tirage effectué avec succès',
      tombola: tombola.toPublicJSON(),
      winner: {
        id: winnerParticipation._id,
        user: winnerParticipation.userId.toPublicJSON(),
        transactionId: winnerParticipation.transactionId,
        amount: winnerParticipation.amount
      }
    });
    
  } catch (error) {
    console.error('Erreur lors du tirage:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors du tirage au sort'
    });
  }
});

// Route pour obtenir les statistiques d'une tombola (admin seulement)
router.get('/:id/stats', authenticateToken, requireAdmin, validateObjectId, async (req, res) => {
  try {
    const tombola = await Tombola.findById(req.params.id);
    if (!tombola) {
      return res.status(404).json({
        error: 'Tombola non trouvée',
        message: 'Aucune tombola trouvée avec cet ID'
      });
    }
    
    // Statistiques des participations
    const participationStats = await Participation.aggregate([
      { $match: { tombolaId: tombola._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    // Statistiques par méthode de paiement
    const paymentStats = await Participation.aggregate([
      { $match: { tombolaId: tombola._id, status: 'validated' } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    res.json({
      tombola: tombola.toPublicJSON(),
      stats: {
        participations: participationStats,
        payments: paymentStats,
        totalParticipations: tombola.totalParticipations,
        totalRevenue: tombola.totalRevenue
      }
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
