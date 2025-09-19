const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, 'Le numéro de téléphone est requis'],
    unique: true,
    match: [/^\+225[0-9]{10}$/, 'Format de numéro ivoirien invalide (+225XXXXXXXXXX)']
  },
  fullName: {
    type: String,
    required: [true, 'Le nom complet est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalParticipations: {
    type: Number,
    default: 0
  },
  participationsByTombola: [{
    tombolaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tombola'
    },
    count: {
      type: Number,
      default: 0
    }
  }],
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Middleware pour hasher le mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour mettre à jour le nombre de participations
userSchema.methods.updateParticipationCount = async function(tombolaId) {
  const existingParticipation = this.participationsByTombola.find(
    p => p.tombolaId.toString() === tombolaId.toString()
  );
  
  if (existingParticipation) {
    existingParticipation.count += 1;
  } else {
    this.participationsByTombola.push({
      tombolaId: tombolaId,
      count: 1
    });
  }
  
  this.totalParticipations += 1;
  return await this.save();
};

// Méthode pour obtenir le nombre de participations pour une tombola
userSchema.methods.getParticipationCount = function(tombolaId) {
  const participation = this.participationsByTombola.find(
    p => p.tombolaId.toString() === tombolaId.toString()
  );
  return participation ? participation.count : 0;
};

// Méthode pour formater les données publiques
userSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    phone: this.phone,
    fullName: this.fullName,
    role: this.role,
    totalParticipations: this.totalParticipations,
    participationsByTombola: this.participationsByTombola,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema);
