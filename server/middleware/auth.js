const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware pour vérifier l'authentification
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Accès refusé',
        message: 'Token d\'authentification requis'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        error: 'Token invalide',
        message: 'Utilisateur non trouvé'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Compte désactivé',
        message: 'Votre compte a été désactivé'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token invalide',
        message: 'Token d\'authentification invalide'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expiré',
        message: 'Veuillez vous reconnecter'
      });
    }

    console.error('Erreur d\'authentification:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la vérification de l\'authentification'
    });
  }
};

// Middleware pour vérifier les droits d'administrateur
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Accès refusé',
      message: 'Droits d\'administrateur requis'
    });
  }
  next();
};

// Middleware pour vérifier que l'utilisateur est propriétaire de la ressource
const requireOwnership = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;
  
  if (req.user.role === 'admin' || req.user._id.toString() === resourceUserId) {
    return next();
  }
  
  return res.status(403).json({
    error: 'Accès refusé',
    message: 'Vous ne pouvez accéder qu\'à vos propres données'
  });
};

// Middleware pour générer un token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Middleware pour vérifier le format du numéro de téléphone ivoirien
const validateIvorianPhone = (phone) => {
  const phoneRegex = /^\+225[0-9]{8}$/;
  return phoneRegex.test(phone);
};

// Middleware pour formater le numéro de téléphone
const formatIvorianPhone = (phone) => {
  // Supprimer tous les espaces et caractères spéciaux
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Si le numéro commence par 0, remplacer par +225
  if (cleaned.startsWith('0')) {
    cleaned = '+225' + cleaned.substring(1);
  }
  
  // Si le numéro ne commence pas par +225, l'ajouter
  if (!cleaned.startsWith('+225')) {
    cleaned = '+225' + cleaned;
  }
  
  return cleaned;
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireOwnership,
  generateToken,
  validateIvorianPhone,
  formatIvorianPhone
};
