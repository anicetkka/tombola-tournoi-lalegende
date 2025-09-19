const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, 'Le numéro de téléphone est requis'],
    match: [/^\+225[0-9]{10}$/, 'Format de numéro ivoirien invalide (+225XXXXXXXXXX)']
  },
  message: {
    type: String,
    required: [true, 'Le message est requis'],
    trim: true,
    maxlength: [1000, 'Le message ne peut pas dépasser 1000 caractères']
  },
  status: {
    type: String,
    enum: ['pending', 'read', 'replied'],
    default: 'pending'
  },
  adminResponse: {
    type: String,
    trim: true,
    maxlength: [1000, 'La réponse ne peut pas dépasser 1000 caractères']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pour mettre à jour updatedAt
contactMessageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Méthode pour marquer comme lu
contactMessageSchema.methods.markAsRead = function() {
  this.status = 'read';
  return this.save();
};

// Méthode pour ajouter une réponse admin
contactMessageSchema.methods.addAdminResponse = function(response) {
  this.adminResponse = response;
  this.status = 'replied';
  return this.save();
};

// Méthode pour obtenir les données publiques
contactMessageSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    phone: this.phone,
    message: this.message,
    status: this.status,
    createdAt: this.createdAt
  };
};

// Méthode pour obtenir les données admin
contactMessageSchema.methods.toAdminJSON = function() {
  return {
    id: this._id,
    phone: this.phone,
    message: this.message,
    status: this.status,
    adminResponse: this.adminResponse,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
