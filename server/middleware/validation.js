const { body, param, query, validationResult } = require('express-validator');

// Middleware pour traiter les erreurs de validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Erreur de validation',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Validations pour l'authentification
const validateRegister = [
  body('phone')
    .matches(/^\+225[0-9]{10}$/)
    .withMessage('Format de numéro ivoirien invalide (+225XXXXXXXXXX)'),
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  handleValidationErrors
];

const validateLogin = [
  body('phone')
    .matches(/^\+225[0-9]{10}$/)
    .withMessage('Format de numéro ivoirien invalide'),
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis'),
  handleValidationErrors
];

// Validations pour les tombolas
const validateTombola = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Le titre doit contenir entre 5 et 200 caractères'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('La description doit contenir entre 10 et 1000 caractères'),
  body('prizeAmount')
    .isInt({ min: 100 })
    .withMessage('La cagnotte doit être d\'au moins 100 FCFA'),
  body('participationPrice')
    .isInt({ min: 50 })
    .withMessage('Le prix de participation doit être d\'au moins 50 FCFA'),
  body('maxParticipants')
    .optional()
    .isInt({ min: 2 })
    .withMessage('Le nombre maximum de participants doit être d\'au moins 2'),
  body('endDate')
    .isISO8601()
    .withMessage('Format de date invalide')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('La date de fin doit être dans le futur');
      }
      return true;
    }),
  handleValidationErrors
];

// Validations pour les participations
const validateParticipation = [
  body('transactionId')
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage('L\'ID de transaction doit contenir entre 5 et 50 caractères'),
  body('paymentPhone')
    .matches(/^\+225[0-9]{10}$/)
    .withMessage('Format de numéro ivoirien invalide pour le paiement'),
  body('paymentMethod')
    .isIn(['wave', 'orange_money'])
    .withMessage('Méthode de paiement invalide (wave ou orange_money)'),
  body('amount')
    .isInt({ min: 50 })
    .withMessage('Le montant doit être d\'au moins 50 FCFA'),
  handleValidationErrors
];

// Validations pour les paramètres d'URL
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('ID invalide'),
  handleValidationErrors
];

// Validations pour les requêtes de recherche
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le numéro de page doit être un entier positif'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100'),
  handleValidationErrors
];

// Validation pour la réinitialisation de mot de passe
const validatePasswordReset = [
  body('phone')
    .matches(/^\+225[0-9]{10}$/)
    .withMessage('Format de numéro ivoirien invalide'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  handleValidationErrors
];

// Validation pour la validation/rejet de participation
const validateParticipationAction = [
  body('action')
    .isIn(['validate', 'reject'])
    .withMessage('L\'action doit être "validate" ou "reject"'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Les notes ne peuvent pas dépasser 500 caractères'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateTombola,
  validateParticipation,
  validateObjectId,
  validatePagination,
  validatePasswordReset,
  validateParticipationAction
};
