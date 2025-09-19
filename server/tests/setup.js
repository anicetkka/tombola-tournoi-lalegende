const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Configuration pour les tests
beforeAll(async () => {
  // Démarrer MongoDB en mémoire pour les tests
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Nettoyer la base de données après chaque test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Fermer la connexion après tous les tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

// Fonction utilitaire pour créer des données de test
const createTestUser = async (userData = {}) => {
  const User = require('../models/User');
  
  const defaultUser = {
    phone: '+225012345678',
    fullName: 'TEST USER',
    password: 'Test123!',
    role: 'user',
    isActive: true,
    ...userData
  };
  
  return await User.create(defaultUser);
};

const createTestTombola = async (tombolaData = {}) => {
  const Tombola = require('../models/Tombola');
  const User = require('../models/User');
  
  // Créer un utilisateur admin pour la tombola
  const admin = await createTestUser({ role: 'admin' });
  
  const defaultTombola = {
    title: 'TEST TOMBOLA',
    description: 'Description de test',
    prizeAmount: 1000,
    participationPrice: 100,
    maxParticipants: 10,
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours dans le futur
    status: 'active',
    createdBy: admin._id,
    ...tombolaData
  };
  
  return await Tombola.create(defaultTombola);
};

const createTestParticipation = async (participationData = {}) => {
  const Participation = require('../models/Participation');
  const User = require('../models/User');
  const Tombola = require('../models/Tombola');
  
  // Créer un utilisateur et une tombola si non fournis
  const user = participationData.userId ? 
    await User.findById(participationData.userId) : 
    await createTestUser();
    
  const tombola = participationData.tombolaId ? 
    await Tombola.findById(participationData.tombolaId) : 
    await createTestTombola();
  
  const defaultParticipation = {
    userId: user._id,
    tombolaId: tombola._id,
    transactionId: 'TXN123456789',
    paymentPhone: '+225012345678',
    paymentMethod: 'wave',
    amount: tombola.participationPrice,
    status: 'pending',
    ...participationData
  };
  
  return await Participation.create(defaultParticipation);
};

// Fonction pour générer un token JWT de test
const generateTestToken = (userId) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '1h' }
  );
};

// Fonction pour créer une requête de test
const createTestRequest = (options = {}) => {
  const {
    method = 'GET',
    url = '/',
    body = {},
    headers = {},
    user = null,
    params = {},
    query = {}
  } = options;
  
  return {
    method,
    url,
    body,
    headers: {
      'content-type': 'application/json',
      ...headers
    },
    user,
    params,
    query,
    ip: '127.0.0.1',
    get: (header) => headers[header.toLowerCase()] || null
  };
};

// Fonction pour créer une réponse de test
const createTestResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis()
  };
  
  return res;
};

module.exports = {
  createTestUser,
  createTestTombola,
  createTestParticipation,
  generateTestToken,
  createTestRequest,
  createTestResponse
};

