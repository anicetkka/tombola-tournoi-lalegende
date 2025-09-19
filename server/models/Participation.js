const mongoose = require('mongoose');

const participationSchema = new mongoose.Schema({
  participationNumber: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tombolaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tombola',
    required: true
  },
  transactionId: {
    type: String,
    required: [true, 'L\'ID de transaction est requis'],
    trim: true,
    uppercase: true
  },
  paymentPhone: {
    type: String,
    required: [true, 'Le numéro de téléphone de paiement est requis'],
    match: [/^\+225[0-9]{10}$/, 'Format de numéro ivoirien invalide (+225XXXXXXXXXX)']
  },
  paymentMethod: {
    type: String,
    enum: ['wave', 'orange_money'],
    required: [true, 'La méthode de paiement est requise']
  },
  amount: {
    type: Number,
    required: [true, 'Le montant est requis'],
    min: [50, 'Le montant doit être d\'au moins 50 FCFA']
  },
  status: {
    type: String,
    enum: ['pending', 'validated', 'rejected', 'completed'],
    default: 'pending'
  },
  isWinner: {
    type: Boolean,
    default: false
  },
  validationNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Les notes ne peuvent pas dépasser 500 caractères']
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  validatedAt: {
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
participationSchema.index({ userId: 1, tombolaId: 1 });
participationSchema.index({ tombolaId: 1, status: 1 });
participationSchema.index({ transactionId: 1 });
participationSchema.index({ status: 1 });
participationSchema.index({ createdAt: -1 });

// Index composé pour éviter les doublons
participationSchema.index({ userId: 1, tombolaId: 1, transactionId: 1 }, { unique: true });

// Fonction pour générer un numéro de participation unique
participationSchema.statics.generateParticipationNumber = async function() {
  let participationNumber;
  let isUnique = false;
  
  while (!isUnique) {
    // Format: TOM + année + mois + jour + 6 chiffres aléatoires
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    
    participationNumber = `TOM${year}${month}${day}${random}`;
    
    // Vérifier l'unicité
    const existing = await this.findOne({ participationNumber });
    if (!existing) {
      isUnique = true;
    }
  }
  
  return participationNumber;
};

// Middleware pour formater les données avant sauvegarde
participationSchema.pre('save', function(next) {
  // Formater le numéro de téléphone
  if (this.paymentPhone && !this.paymentPhone.startsWith('+225')) {
    this.paymentPhone = '+225' + this.paymentPhone.replace(/^\+225/, '');
  }
  
  // Formater l'ID de transaction en majuscules
  if (this.transactionId) {
    this.transactionId = this.transactionId.toUpperCase();
  }
  
  next();
});

// Méthode pour valider une participation
participationSchema.methods.validateParticipation = async function(adminId, notes = '') {
  if (this.status !== 'pending') {
    throw new Error('Cette participation a déjà été traitée');
  }
  
  this.status = 'validated';
  this.validatedBy = adminId;
  this.validatedAt = new Date();
  this.validationNotes = notes;
  
  // Mettre à jour le compteur de participations de l'utilisateur
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(this.userId, {
    $inc: { totalParticipations: 1 }
  });
  
  // Mettre à jour les statistiques de la tombola
  const Tombola = mongoose.model('Tombola');
  const tombola = await Tombola.findById(this.tombolaId);
  if (tombola) {
    await tombola.updateStats();
  }
  
  return await this.save();
};

// Méthode pour rejeter une participation
participationSchema.methods.reject = async function(adminId, notes = '') {
  if (this.status !== 'pending') {
    throw new Error('Cette participation a déjà été traitée');
  }
  
  this.status = 'rejected';
  this.validatedBy = adminId;
  this.validatedAt = new Date();
  this.validationNotes = notes;
  
  return await this.save();
};

// Méthode pour marquer comme gagnant
participationSchema.methods.markAsWinner = async function() {
  this.isWinner = true;
  this.status = 'completed';
  return await this.save();
};

// Méthode pour obtenir les données publiques
participationSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    participationNumber: this.participationNumber,
    tombolaId: this.tombolaId,
    transactionId: this.transactionId,
    paymentMethod: this.paymentMethod,
    amount: this.amount,
    status: this.status,
    isWinner: this.isWinner,
    createdAt: this.createdAt,
    validatedAt: this.validatedAt
  };
};

// Méthode pour obtenir les données complètes (admin)
participationSchema.methods.toAdminJSON = function() {
  return {
    id: this._id,
    participationNumber: this.participationNumber,
    userId: this.userId,
    tombolaId: this.tombolaId,
    transactionId: this.transactionId,
    paymentPhone: this.paymentPhone,
    paymentMethod: this.paymentMethod,
    amount: this.amount,
    status: this.status,
    isWinner: this.isWinner,
    validationNotes: this.validationNotes,
    validatedBy: this.validatedBy,
    validatedAt: this.validatedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('Participation', participationSchema);
