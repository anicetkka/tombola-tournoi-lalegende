const mongoose = require('mongoose');

const tombolaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre de la tombola est requis'],
    trim: true,
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },
  prizeAmount: {
    type: Number,
    required: [true, 'Le montant de la cagnotte est requis'],
    min: [100, 'La cagnotte doit être d\'au moins 100 FCFA']
  },
  participationPrice: {
    type: Number,
    required: [true, 'Le prix de participation est requis'],
    min: [50, 'Le prix de participation doit être d\'au moins 50 FCFA']
  },
  maxParticipants: {
    type: Number,
    min: [2, 'Il faut au moins 2 participants'],
    default: null // null = pas de limite
  },
  endDate: {
    type: Date,
    required: [true, 'La date de fin est requise'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'La date de fin doit être dans le futur'
    }
  },
  status: {
    type: String,
    enum: ['active', 'ended', 'drawn', 'cancelled'],
    default: 'active'
  },
  isDrawn: {
    type: Boolean,
    default: false
  },
  drawDate: {
    type: Date
  },
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participation'
  },
  totalParticipations: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
tombolaSchema.index({ status: 1 });
tombolaSchema.index({ endDate: 1 });
tombolaSchema.index({ createdAt: -1 });
tombolaSchema.index({ isDrawn: 1 });

// Méthode pour vérifier si la tombola est active
tombolaSchema.methods.isActive = function() {
  return this.status === 'active' && this.endDate > new Date();
};

// Méthode pour vérifier si la tombola peut être tirée
tombolaSchema.methods.canBeDrawn = function() {
  return this.status === 'active' && 
         this.endDate <= new Date() && 
         !this.isDrawn &&
         this.totalParticipations > 0;
};

// Méthode pour mettre à jour les statistiques
tombolaSchema.methods.updateStats = async function() {
  const Participation = mongoose.model('Participation');
  const stats = await Participation.aggregate([
    { $match: { tombolaId: this._id, status: 'validated' } },
    {
      $group: {
        _id: null,
        totalParticipations: { $sum: 1 },
        totalRevenue: { $sum: '$amount' }
      }
    }
  ]);
  
  if (stats.length > 0) {
    this.totalParticipations = stats[0].totalParticipations;
    this.totalRevenue = stats[0].totalRevenue;
  } else {
    this.totalParticipations = 0;
    this.totalRevenue = 0;
  }
  
  return await this.save();
};

// Méthode pour effectuer le tirage
tombolaSchema.methods.performDraw = async function() {
  if (!this.canBeDrawn()) {
    throw new Error('Cette tombola ne peut pas être tirée');
  }
  
  const Participation = mongoose.model('Participation');
  const participations = await Participation.find({
    tombolaId: this._id,
    status: 'validated'
  });
  
  if (participations.length === 0) {
    throw new Error('Aucune participation validée pour cette tombola');
  }
  
  // Algorithme de tirage sécurisé
  const crypto = require('crypto');
  const randomIndex = crypto.randomInt(0, participations.length);
  const winner = participations[randomIndex];
  
  // Mettre à jour la tombola
  this.status = 'drawn';
  this.isDrawn = true;
  this.drawDate = new Date();
  this.winnerId = winner._id;
  
  // Mettre à jour toutes les participations
  await Participation.updateMany(
    { tombolaId: this._id },
    { 
      status: 'completed',
      isWinner: { $eq: ['$_id', winner._id] }
    }
  );
  
  return await this.save();
};

// Méthode pour obtenir les données publiques
tombolaSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    prizeAmount: this.prizeAmount,
    participationPrice: this.participationPrice,
    maxParticipants: this.maxParticipants,
    endDate: this.endDate,
    status: this.status,
    isDrawn: this.isDrawn,
    totalParticipations: this.totalParticipations,
    totalRevenue: this.totalRevenue,
    createdAt: this.createdAt,
    canParticipate: this.isActive()
  };
};

module.exports = mongoose.model('Tombola', tombolaSchema);
