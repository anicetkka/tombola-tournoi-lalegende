// Gestionnaire d'erreurs personnalisé
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Gestionnaire d'erreurs global
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log de l'erreur
  console.error('❌ Erreur:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Erreurs de validation Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
    
    return res.status(400).json({
      error: 'Erreur de validation',
      details: errors
    });
  }

  // Erreurs de cast (ID invalide)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'ID invalide',
      message: 'L\'ID fourni n\'est pas valide'
    });
  }

  // Erreurs de duplication (clé unique)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: 'Données dupliquées',
      message: `Cette ${field} est déjà utilisée`
    });
  }

  // Erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token invalide',
      message: 'Token d\'authentification invalide'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expiré',
      message: 'Veuillez vous reconnecter'
    });
  }

  // Erreurs de syntaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'JSON invalide',
      message: 'Format JSON invalide dans la requête'
    });
  }

  // Erreur par défaut
  res.status(err.statusCode).json({
    error: err.status === 'error' ? 'Erreur serveur' : 'Erreur client',
    message: err.isOperational ? err.message : 'Une erreur est survenue',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Gestionnaire pour les routes non trouvées
const notFoundHandler = (req, res, next) => {
  const err = new AppError(`Route ${req.originalUrl} non trouvée`, 404);
  next(err);
};

// Gestionnaire pour les erreurs asynchrones
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Validation des paramètres requis
const validateRequired = (fields) => {
  return (req, res, next) => {
    const missing = fields.filter(field => !req.body[field]);
    
    if (missing.length > 0) {
      return res.status(400).json({
        error: 'Champs manquants',
        message: `Les champs suivants sont requis: ${missing.join(', ')}`
      });
    }
    
    next();
  };
};

// Validation des types de données
const validateTypes = (schema) => {
  return (req, res, next) => {
    const errors = [];
    
    Object.keys(schema).forEach(field => {
      const { type, required } = schema[field];
      const value = req.body[field];
      
      if (required && (value === undefined || value === null || value === '')) {
        errors.push({
          field,
          message: `Le champ ${field} est requis`
        });
        return;
      }
      
      if (value !== undefined && value !== null && value !== '') {
        if (type === 'string' && typeof value !== 'string') {
          errors.push({
            field,
            message: `Le champ ${field} doit être une chaîne de caractères`
          });
        } else if (type === 'number' && typeof value !== 'number') {
          errors.push({
            field,
            message: `Le champ ${field} doit être un nombre`
          });
        } else if (type === 'boolean' && typeof value !== 'boolean') {
          errors.push({
            field,
            message: `Le champ ${field} doit être un booléen`
          });
        } else if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push({
            field,
            message: `Le champ ${field} doit être une adresse email valide`
          });
        } else if (type === 'phone' && !/^\+225[0-9]{8}$/.test(value)) {
          errors.push({
            field,
            message: `Le champ ${field} doit être un numéro de téléphone ivoirien valide`
          });
        }
      }
    });
    
    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Erreur de validation',
        details: errors
      });
    }
    
    next();
  };
};

module.exports = {
  AppError,
  globalErrorHandler,
  notFoundHandler,
  catchAsync,
  validateRequired,
  validateTypes
};

