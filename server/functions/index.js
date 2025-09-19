const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

// Import des routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const tombolaRoutes = require('./routes/tombolas');
const participationRoutes = require('./routes/participations');
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contact');

const app = express();

// Middleware de sécurité
app.use(helmet());
app.use(cors({
  origin: true, // Permet toutes les origines en production
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par windowMs
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
  }
});
app.use('/api/', limiter);

// Middleware pour parser le JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connexion à MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connexion à MongoDB réussie');
  } catch (err) {
    console.error('❌ Erreur de connexion MongoDB:', err);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tombolas', tombolaRoutes);
app.use('/api/participations', participationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Serveur de tombola opérationnel',
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    message: 'La route demandée n\'existe pas'
  });
});

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erreur de validation',
      details: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'ID invalide',
      message: 'L\'ID fourni n\'est pas valide'
    });
  }
  
  res.status(err.status || 500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// Initialiser la connexion à la base de données
connectDB();

// Exporter l'application comme fonction Firebase
exports.api = functions.https.onRequest(app);
