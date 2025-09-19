const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Configuration de rate limiting
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Trop de requêtes',
      message: message || 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Rate limiting pour l'authentification
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 tentatives max
  'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
);

// Rate limiting pour les participations
const participationLimiter = createRateLimit(
  60 * 1000, // 1 minute
  3, // 3 participations max par minute
  'Trop de participations. Réessayez dans une minute.'
);

// Rate limiting général
const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requêtes max
  'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
);

// Configuration Helmet pour la sécurité
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Middleware pour valider les numéros de téléphone ivoiriens
const validateIvorianPhone = (req, res, next) => {
  const phoneRegex = /^\+225[0-9]{8}$/;
  
  if (req.body.phone && !phoneRegex.test(req.body.phone)) {
    return res.status(400).json({
      error: 'Format de téléphone invalide',
      message: 'Le numéro de téléphone doit être au format ivoirien (+225XXXXXXXX)'
    });
  }
  
  next();
};

// Middleware pour valider les montants
const validateAmount = (req, res, next) => {
  const { amount } = req.body;
  
  if (amount !== undefined) {
    if (typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({
        error: 'Montant invalide',
        message: 'Le montant doit être un nombre positif'
      });
    }
    
    // Vérifier que le montant n'est pas trop élevé (sécurité)
    if (amount > 1000000) { // 1 million FCFA max
      return res.status(400).json({
        error: 'Montant trop élevé',
        message: 'Le montant ne peut pas dépasser 1 000 000 FCFA'
      });
    }
  }
  
  next();
};

// Middleware pour valider les IDs MongoDB
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      error: 'ID invalide',
      message: 'L\'ID fourni n\'est pas valide'
    });
  }
  
  next();
};

// Middleware pour nettoyer les données d'entrée
const sanitizeInput = (req, res, next) => {
  // Nettoyer les chaînes de caractères
  const sanitizeString = (str) => {
    if (typeof str === 'string') {
      return str.trim().replace(/[<>]/g, '');
    }
    return str;
  };
  
  // Nettoyer le body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
  }
  
  // Nettoyer les query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key]);
      }
    });
  }
  
  next();
};

// Middleware pour logger les requêtes suspectes
const logSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    /script/i,
    /javascript/i,
    /onload/i,
    /onerror/i,
    /<script/i,
    /eval\(/i,
    /expression\(/i
  ];
  
  const checkSuspicious = (obj) => {
    if (typeof obj === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(obj));
    }
    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(checkSuspicious);
    }
    return false;
  };
  
  if (checkSuspicious(req.body) || checkSuspicious(req.query)) {
    console.warn('⚠️ Activité suspecte détectée:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

module.exports = {
  authLimiter,
  participationLimiter,
  generalLimiter,
  helmetConfig,
  validateIvorianPhone,
  validateAmount,
  validateObjectId,
  sanitizeInput,
  logSuspiciousActivity
};

