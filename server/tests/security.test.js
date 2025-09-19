const request = require('supertest');
const app = require('../index');
const { createTestUser, createTestTombola, createTestParticipation, generateTestToken } = require('./setup');

describe('Sécurité', () => {
  let adminToken;
  let userToken;
  let adminUser;
  let regularUser;

  beforeEach(async () => {
    // Créer un utilisateur admin
    adminUser = await createTestUser({ role: 'admin' });
    adminToken = generateTestToken(adminUser._id);

    // Créer un utilisateur régulier
    regularUser = await createTestUser({ role: 'user' });
    userToken = generateTestToken(regularUser._id);
  });

  describe('Authentification et autorisation', () => {
    it('devrait rejeter les requêtes sans token d\'authentification', async () => {
      const tombola = await createTestTombola({ title: 'TOMBOLA SECURITE' });

      // Tentative d\'accès sans token
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Accès refusé');
    });

    it('devrait rejeter les requêtes avec un token invalide', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Token invalide');
    });

    it('devrait rejeter les requêtes avec un token expiré', async () => {
      // Créer un token expiré
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { userId: regularUser._id },
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '-1h' } // Expiré
      );

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Token expiré');
    });

    it('devrait rejeter les accès non autorisés aux routes admin', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Accès refusé');
    });

    it('devrait rejeter les tentatives d\'accès aux données d\'autres utilisateurs', async () => {
      const otherUser = await createTestUser({ 
        phone: '+225999999999',
        fullName: 'OTHER USER'
      });

      const response = await request(app)
        .get(`/api/users/${otherUser._id}/profile`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Accès refusé');
    });
  });

  describe('Validation des données d\'entrée', () => {
    it('devrait rejeter les tentatives d\'injection SQL', async () => {
      const maliciousData = {
        phone: "+225012345678'; DROP TABLE users; --",
        fullName: "'; DROP TABLE users; --",
        password: "Test123!"
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(maliciousData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('devrait rejeter les tentatives d\'injection XSS', async () => {
      const maliciousData = {
        phone: '+225012345678',
        fullName: '<script>alert("XSS")</script>',
        password: 'Test123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(maliciousData)
        .expect(201);

      // Vérifier que le script est échappé
      expect(response.body.user.fullName).not.toContain('<script>');
    });

    it('devrait rejeter les données avec des caractères spéciaux malveillants', async () => {
      const maliciousData = {
        phone: '+225012345678',
        fullName: '${7*7}',
        password: 'Test123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(maliciousData)
        .expect(201);

      // Vérifier que l'expression n'est pas évaluée
      expect(response.body.user.fullName).toBe('${7*7}');
    });

    it('devrait valider les formats de numéros de téléphone', async () => {
      const invalidPhones = [
        '012345678', // Format invalide
        '+225123456789', // Trop long
        '+2251234567', // Trop court
        '+226012345678', // Mauvais indicatif
        'abc123456789' // Caractères non numériques
      ];

      for (const phone of invalidPhones) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            phone,
            fullName: 'TEST USER',
            password: 'Test123!'
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    it('devrait valider les formats de montants', async () => {
      const tombola = await createTestTombola({ title: 'TOMBOLA VALIDATION' });

      const invalidAmounts = [
        -100, // Négatif
        0, // Zéro
        'abc', // Non numérique
        null, // Null
        undefined // Undefined
      ];

      for (const amount of invalidAmounts) {
        const response = await request(app)
          .post('/api/participations')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            tombolaId: tombola._id,
            transactionId: 'TXN123456789',
            paymentPhone: '+225012345678',
            paymentMethod: 'wave',
            amount
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });
  });

  describe('Rate limiting', () => {
    it('devrait limiter le nombre de tentatives de connexion', async () => {
      // Essayer de se connecter 10 fois rapidement
      const loginRequests = Array.from({ length: 10 }, () =>
        request(app)
          .post('/api/auth/login')
          .send({
            phone: '+225012345678',
            password: 'WrongPassword'
          })
      );

      const responses = await Promise.all(loginRequests);
      
      // Au moins une requête devrait être limitée
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('devrait limiter le nombre de participations par minute', async () => {
      const tombola = await createTestTombola({ title: 'TOMBOLA RATE LIMIT' });

      // Essayer de créer 10 participations rapidement
      const participationRequests = Array.from({ length: 10 }, (_, index) =>
        request(app)
          .post('/api/participations')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            tombolaId: tombola._id,
            transactionId: `TXN${index.toString().padStart(3, '0')}`,
            paymentPhone: '+225012345678',
            paymentMethod: 'wave',
            amount: tombola.participationPrice
          })
      );

      const responses = await Promise.all(participationRequests);
      
      // Au moins une requête devrait être limitée
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Validation des IDs', () => {
    it('devrait rejeter les IDs MongoDB invalides', async () => {
      const invalidIds = [
        'invalid_id',
        '123',
        'abc123',
        '507f1f77bcf86cd799439011', // ID valide mais inexistant
        'null',
        'undefined'
      ];

      for (const id of invalidIds) {
        const response = await request(app)
          .get(`/api/tombolas/${id}`)
          .expect(400);

        expect(response.body).toHaveProperty('error', 'ID invalide');
      }
    });

    it('devrait rejeter les tentatives d\'accès avec des IDs malformés', async () => {
      const maliciousIds = [
        '507f1f77bcf86cd799439011\'; DROP TABLE tombolas; --',
        '507f1f77bcf86cd799439011<script>alert("XSS")</script>',
        '507f1f77bcf86cd799439011${7*7}'
      ];

      for (const id of maliciousIds) {
        const response = await request(app)
          .get(`/api/tombolas/${id}`)
          .expect(400);

        expect(response.body).toHaveProperty('error', 'ID invalide');
      }
    });
  });

  describe('Validation des en-têtes', () => {
    it('devrait rejeter les requêtes avec des en-têtes malveillants', async () => {
      const response = await request(app)
        .get('/api/tombolas')
        .set('User-Agent', '<script>alert("XSS")</script>')
        .set('X-Forwarded-For', '127.0.0.1\'; DROP TABLE users; --')
        .expect(200);

      // La requête devrait réussir mais les en-têtes malveillants ne devraient pas être traités
      expect(response.body).toHaveProperty('tombolas');
    });

    it('devrait valider les en-têtes de contenu', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'text/plain')
        .send('invalid json')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Validation des méthodes HTTP', () => {
    it('devrait rejeter les méthodes HTTP non autorisées', async () => {
      const tombola = await createTestTombola({ title: 'TOMBOLA METHODES' });

      // Essayer d'utiliser des méthodes non autorisées
      const methods = ['PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

      for (const method of methods) {
        const response = await request(app)
          [method.toLowerCase()]('/api/tombolas')
          .expect(404);

        expect(response.body).toHaveProperty('error', 'Route non trouvée');
      }
    });
  });

  describe('Validation des tailles de données', () => {
    it('devrait rejeter les requêtes avec des données trop volumineuses', async () => {
      const largeData = {
        phone: '+225012345678',
        fullName: 'A'.repeat(10000), // Nom très long
        password: 'Test123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(largeData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('devrait rejeter les requêtes avec des tableaux trop volumineux', async () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => ({
        phone: `+22500000000${i}`,
        fullName: `USER ${i}`,
        password: 'Test123!'
      }));

      const response = await request(app)
        .post('/api/auth/register')
        .send(largeArray)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Validation des types de données', () => {
    it('devrait rejeter les données avec des types incorrects', async () => {
      const invalidTypes = [
        { phone: 123456789, fullName: 'TEST', password: 'Test123!' }, // Phone numérique
        { phone: '+225012345678', fullName: 123, password: 'Test123!' }, // Nom numérique
        { phone: '+225012345678', fullName: 'TEST', password: 123 }, // Password numérique
        { phone: null, fullName: 'TEST', password: 'Test123!' }, // Phone null
        { phone: '+225012345678', fullName: null, password: 'Test123!' }, // Nom null
        { phone: '+225012345678', fullName: 'TEST', password: null } // Password null
      ];

      for (const data of invalidTypes) {
        const response = await request(app)
          .post('/api/auth/register')
          .send(data)
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });
  });
});