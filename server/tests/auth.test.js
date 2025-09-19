const request = require('supertest');
const app = require('../index');
const { createTestUser, generateTestToken } = require('./setup');

describe('Authentication', () => {
  describe('POST /api/auth/register', () => {
    it('devrait créer un nouvel utilisateur avec des données valides', async () => {
      const userData = {
        phone: '+225012345678',
        fullName: 'TEST USER',
        password: 'Test123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Inscription réussie');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.phone).toBe(userData.phone);
      expect(response.body.user.fullName).toBe(userData.fullName.toUpperCase());
      expect(response.body.user.role).toBe('user');
    });

    it('devrait échouer avec un numéro de téléphone invalide', async () => {
      const userData = {
        phone: '012345678', // Format invalide
        fullName: 'TEST USER',
        password: 'Test123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('devrait échouer avec un mot de passe trop court', async () => {
      const userData = {
        phone: '+225012345678',
        fullName: 'TEST USER',
        password: '123' // Trop court
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('devrait échouer si l\'utilisateur existe déjà', async () => {
      const userData = {
        phone: '+225012345678',
        fullName: 'TEST USER',
        password: 'Test123!'
      };

      // Créer l'utilisateur
      await createTestUser(userData);

      // Essayer de créer le même utilisateur
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Utilisateur existant');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await createTestUser({
        phone: '+225012345678',
        fullName: 'TEST USER',
        password: 'Test123!'
      });
    });

    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      const loginData = {
        phone: '+225012345678',
        password: 'Test123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Connexion réussie');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.phone).toBe(loginData.phone);
    });

    it('devrait échouer avec un mot de passe incorrect', async () => {
      const loginData = {
        phone: '+225012345678',
        password: 'WrongPassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Identifiants invalides');
    });

    it('devrait échouer avec un numéro de téléphone inexistant', async () => {
      const loginData = {
        phone: '+225999999999',
        password: 'Test123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Identifiants invalides');
    });
  });

  describe('GET /api/auth/verify', () => {
    it('devrait vérifier un token valide', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id);

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('valid', true);
      expect(response.body).toHaveProperty('user');
    });

    it('devrait échouer avec un token invalide', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Token invalide');
    });

    it('devrait échouer sans token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Token manquant');
    });
  });
});

