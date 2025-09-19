const request = require('supertest');
const app = require('../index');
const { createTestUser, createTestTombola, createTestParticipation, generateTestToken } = require('./setup');

describe('Participations', () => {
  let adminToken;
  let userToken;
  let adminUser;
  let regularUser;
  let tombola;

  beforeEach(async () => {
    // Créer un utilisateur admin
    adminUser = await createTestUser({ role: 'admin' });
    adminToken = generateTestToken(adminUser._id);

    // Créer un utilisateur régulier
    regularUser = await createTestUser({ role: 'user' });
    userToken = generateTestToken(regularUser._id);

    // Créer une tombola de test
    tombola = await createTestTombola({ title: 'TOMBOLA TEST' });
  });

  describe('POST /api/participations', () => {
    it('devrait créer une nouvelle participation', async () => {
      const participationData = {
        tombolaId: tombola._id,
        transactionId: 'TXN123456789',
        paymentPhone: '+225012345678',
        paymentMethod: 'wave',
        amount: tombola.participationPrice
      };

      const response = await request(app)
        .post('/api/participations')
        .set('Authorization', `Bearer ${userToken}`)
        .send(participationData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Participation soumise avec succès');
      expect(response.body).toHaveProperty('participation');
      expect(response.body.participation.status).toBe('pending');
      expect(response.body.participation.transactionId).toBe(participationData.transactionId.toUpperCase());
    });

    it('devrait échouer avec un montant incorrect', async () => {
      const participationData = {
        tombolaId: tombola._id,
        transactionId: 'TXN123456789',
        paymentPhone: '+225012345678',
        paymentMethod: 'wave',
        amount: 999 // Montant incorrect
      };

      const response = await request(app)
        .post('/api/participations')
        .set('Authorization', `Bearer ${userToken}`)
        .send(participationData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Montant incorrect');
    });

    it('devrait échouer avec une tombola inactive', async () => {
      // Créer une tombola terminée
      const endedTombola = await createTestTombola({ 
        title: 'TOMBOLA TERMINEE',
        status: 'ended'
      });

      const participationData = {
        tombolaId: endedTombola._id,
        transactionId: 'TXN123456789',
        paymentPhone: '+225012345678',
        paymentMethod: 'wave',
        amount: endedTombola.participationPrice
      };

      const response = await request(app)
        .post('/api/participations')
        .set('Authorization', `Bearer ${userToken}`)
        .send(participationData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Tombola non active');
    });

    it('devrait échouer avec une transaction déjà utilisée', async () => {
      const participationData = {
        tombolaId: tombola._id,
        transactionId: 'TXN123456789',
        paymentPhone: '+225012345678',
        paymentMethod: 'wave',
        amount: tombola.participationPrice
      };

      // Créer la première participation
      await createTestParticipation({
        ...participationData,
        userId: regularUser._id
      });

      // Essayer de créer une deuxième participation avec le même ID de transaction
      const response = await request(app)
        .post('/api/participations')
        .set('Authorization', `Bearer ${userToken}`)
        .send(participationData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Transaction déjà utilisée');
    });

    it('devrait échouer sans authentification', async () => {
      const participationData = {
        tombolaId: tombola._id,
        transactionId: 'TXN123456789',
        paymentPhone: '+225012345678',
        paymentMethod: 'wave',
        amount: tombola.participationPrice
      };

      const response = await request(app)
        .post('/api/participations')
        .send(participationData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Accès refusé');
    });
  });

  describe('GET /api/participations', () => {
    beforeEach(async () => {
      // Créer quelques participations de test
      await createTestParticipation({
        userId: regularUser._id,
        tombolaId: tombola._id,
        status: 'pending'
      });
      
      await createTestParticipation({
        userId: regularUser._id,
        tombolaId: tombola._id,
        status: 'validated'
      });
    });

    it('devrait retourner la liste des participations (admin seulement)', async () => {
      const response = await request(app)
        .get('/api/participations')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('participations');
      expect(response.body.participations).toHaveLength(2);
      expect(response.body).toHaveProperty('pagination');
    });

    it('devrait filtrer les participations par statut', async () => {
      const response = await request(app)
        .get('/api/participations?status=pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.participations).toHaveLength(1);
      expect(response.body.participations[0].status).toBe('pending');
    });

    it('devrait échouer si l\'utilisateur n\'est pas admin', async () => {
      const response = await request(app)
        .get('/api/participations')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Accès refusé');
    });
  });

  describe('GET /api/users/participations', () => {
    beforeEach(async () => {
      // Créer quelques participations pour l'utilisateur
      await createTestParticipation({
        userId: regularUser._id,
        tombolaId: tombola._id,
        status: 'pending'
      });
      
      await createTestParticipation({
        userId: regularUser._id,
        tombolaId: tombola._id,
        status: 'validated'
      });
    });

    it('devrait retourner les participations de l\'utilisateur connecté', async () => {
      const response = await request(app)
        .get('/api/users/participations')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('participations');
      expect(response.body.participations).toHaveLength(2);
      expect(response.body).toHaveProperty('pagination');
    });

    it('devrait filtrer les participations par statut', async () => {
      const response = await request(app)
        .get('/api/users/participations?status=pending')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.participations).toHaveLength(1);
      expect(response.body.participations[0].status).toBe('pending');
    });

    it('devrait échouer sans authentification', async () => {
      const response = await request(app)
        .get('/api/users/participations')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Accès refusé');
    });
  });

  describe('PUT /api/participations/:id/validate', () => {
    let participation;

    beforeEach(async () => {
      participation = await createTestParticipation({
        userId: regularUser._id,
        tombolaId: tombola._id,
        status: 'pending'
      });
    });

    it('devrait valider une participation (admin seulement)', async () => {
      const response = await request(app)
        .put(`/api/participations/${participation._id}/validate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'validate', notes: 'Paiement vérifié' })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Participation validée avec succès');
      expect(response.body.participation.status).toBe('validated');
    });

    it('devrait rejeter une participation (admin seulement)', async () => {
      const response = await request(app)
        .put(`/api/participations/${participation._id}/validate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'reject', notes: 'Paiement non trouvé' })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Participation rejetée');
      expect(response.body.participation.status).toBe('rejected');
    });

    it('devrait échouer si la participation n\'est pas en attente', async () => {
      // Marquer la participation comme validée
      participation.status = 'validated';
      await participation.save();

      const response = await request(app)
        .put(`/api/participations/${participation._id}/validate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'validate', notes: 'Test' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Participation déjà traitée');
    });

    it('devrait échouer si l\'utilisateur n\'est pas admin', async () => {
      const response = await request(app)
        .put(`/api/participations/${participation._id}/validate`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ action: 'validate', notes: 'Test' })
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Accès refusé');
    });

    it('devrait échouer avec une action invalide', async () => {
      const response = await request(app)
        .put(`/api/participations/${participation._id}/validate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'invalid', notes: 'Test' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Action invalide');
    });
  });

  describe('GET /api/participations/:id', () => {
    let participation;

    beforeEach(async () => {
      participation = await createTestParticipation({
        userId: regularUser._id,
        tombolaId: tombola._id
      });
    });

    it('devrait retourner les détails d\'une participation', async () => {
      const response = await request(app)
        .get(`/api/participations/${participation._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('participation');
      expect(response.body.participation.id).toBe(participation._id.toString());
    });

    it('devrait échouer si l\'utilisateur n\'est pas le propriétaire', async () => {
      // Créer un autre utilisateur
      const otherUser = await createTestUser({ phone: '+225999999999' });
      const otherToken = generateTestToken(otherUser._id);

      const response = await request(app)
        .get(`/api/participations/${participation._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Accès refusé');
    });

    it('devrait permettre à l\'admin de voir toutes les participations', async () => {
      const response = await request(app)
        .get(`/api/participations/${participation._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('participation');
    });
  });
});

