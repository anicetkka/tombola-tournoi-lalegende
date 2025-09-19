const express = require('express');
const User = require('../models/User');
const { generateToken, formatIvorianPhone, validateIvorianPhone } = require('../middleware/auth');
const { validateRegister, validateLogin, validatePasswordReset } = require('../middleware/validation');

const router = express.Router();

// Route d'inscription
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { phone, fullName, password } = req.body;
    
    // Formater le numéro de téléphone
    const formattedPhone = formatIvorianPhone(phone);
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ phone: formattedPhone });
    if (existingUser) {
      return res.status(400).json({
        error: 'Utilisateur existant',
        message: 'Un compte existe déjà avec ce numéro de téléphone'
      });
    }
    
    // Créer le nouvel utilisateur
    const user = new User({
      phone: formattedPhone,
      fullName: fullName.toUpperCase(), // Formatage en majuscules selon les préférences
      password
    });
    
    await user.save();
    
    // Générer le token JWT
    const token = generateToken(user._id);
    
    res.status(201).json({
      message: 'Inscription réussie',
      token,
      user: user.toPublicJSON()
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la création du compte'
    });
  }
});

// Route de connexion
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    // Formater le numéro de téléphone
    const formattedPhone = formatIvorianPhone(phone);
    
    // Trouver l'utilisateur
    const user = await User.findOne({ phone: formattedPhone });
    if (!user) {
      return res.status(401).json({
        error: 'Identifiants invalides',
        message: 'Numéro de téléphone ou mot de passe incorrect'
      });
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Identifiants invalides',
        message: 'Numéro de téléphone ou mot de passe incorrect'
      });
    }
    
    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Compte désactivé',
        message: 'Votre compte a été désactivé. Contactez l\'administrateur.'
      });
    }
    
    // Mettre à jour la dernière connexion
    user.lastLogin = new Date();
    await user.save();
    
    // Générer le token JWT
    const token = generateToken(user._id);
    
    res.json({
      message: 'Connexion réussie',
      token,
      user: user.toPublicJSON()
    });
    
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Erreur lors de la connexion'
    });
  }
});

// Route de réinitialisation de mot de passe (admin seulement)
router.post('/reset-password', validatePasswordReset, async (req, res) => {
  try {
    const { phone, newPassword } = req.body;
    
    // Formater le numéro de téléphone
    const formattedPhone = formatIvorianPhone(phone);
    
    // Trouver l'utilisateur
    const user = await User.findOne({ phone: formattedPhone });
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'Aucun compte trouvé avec ce numéro de téléphone'
      });
    }
    
    // Mettre à jour le mot de passe
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

// Route pour vérifier le token (optionnel)
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        error: 'Token manquant',
        message: 'Token d\'authentification requis'
      });
    }
    
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Token invalide',
        message: 'Utilisateur non trouvé ou compte désactivé'
      });
    }
    
    res.json({
      valid: true,
      user: user.toPublicJSON()
    });
    
  } catch (error) {
    res.status(401).json({
      error: 'Token invalide',
      message: 'Token d\'authentification invalide ou expiré'
    });
  }
});

// Route pour obtenir les informations du compte connecté
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        error: 'Token manquant',
        message: 'Token d\'authentification requis'
      });
    }
    
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.json({
      user: user.toPublicJSON()
    });
    
  } catch (error) {
    res.status(401).json({
      error: 'Token invalide',
      message: 'Token d\'authentification invalide ou expiré'
    });
  }
});

module.exports = router;
