const express = require('express');
const { body, validationResult } = require('express-validator');
const ContactMessage = require('../models/ContactMessage');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation pour créer un message de contact
const validateContactMessage = [
  body('phone')
    .matches(/^\+225[0-9]{10}$/)
    .withMessage('Format de numéro ivoirien invalide (+225XXXXXXXXXX)'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Le message doit contenir entre 10 et 1000 caractères')
];

// POST /api/contact - Créer un nouveau message de contact
router.post('/', validateContactMessage, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { phone, message } = req.body;

    const contactMessage = new ContactMessage({
      phone,
      message
    });

    await contactMessage.save();

    res.status(201).json({
      success: true,
      message: 'Votre message a été envoyé à l\'administrateur. Vous recevrez une réponse sous 24h.',
      data: contactMessage.toPublicJSON()
    });

  } catch (error) {
    console.error('Erreur lors de la création du message de contact:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// GET /api/contact - Récupérer tous les messages (admin seulement)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const messages = await ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ContactMessage.countDocuments(filter);

    res.json({
      success: true,
      data: messages.map(msg => msg.toAdminJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// GET /api/contact/:id - Récupérer un message spécifique (admin seulement)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    res.json({
      success: true,
      data: message.toAdminJSON()
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// PUT /api/contact/:id/read - Marquer un message comme lu (admin seulement)
router.put('/:id/read', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    await message.markAsRead();

    res.json({
      success: true,
      message: 'Message marqué comme lu',
      data: message.toAdminJSON()
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// PUT /api/contact/:id/response - Ajouter une réponse admin (admin seulement)
router.put('/:id/response', authenticateToken, requireAdmin, [
  body('response')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('La réponse doit contenir entre 1 et 1000 caractères')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const message = await ContactMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    await message.addAdminResponse(req.body.response);

    res.json({
      success: true,
      message: 'Réponse ajoutée avec succès',
      data: message.toAdminJSON()
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout de la réponse:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// DELETE /api/contact/:id - Supprimer un message (admin seulement)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Message supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;
