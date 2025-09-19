const request = require('supertest');
const app = require('../index');
const { createTestUser, createTestTombola, generateTestToken } = require('./setup');

describe('Tombolas', () => {
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

  describe('GET /api/tombolas', () => {
    it('devrait retourner la liste des tombolas', async () => {
      // Créer quelques tombolas de test
      await createTestTombola({ title: 'TOMBOLA 1' });
      await createTestTombola({ title: 'TOMBOLA 2' });

      const response = await request(app)
        .get('/api/tombolas')
        .expect(200);

      expect(response.body).toHaveProperty('tombolas');
      expect(response.body.tombolas).toHaveLength(2);
      expect(response.body).toHaveProperty('pagination');
    });

    it('devrait filtrer les tombolas par statut', async () => {
      await createTestTombola({ title: 'TOMBOLA ACTIVE', status: 'active' });
      await createTestTombola({ title: 'TOMBOLA ENDED', status: 'ended' });

      const response = await request(app)
        .get('/api/tombolas?status=active')
        .expect(200);

      expect(response.body.tombolas).toHaveLength(1);
      expect(response.body.tombolas[0].status).toBe('active');
    });
  });

  describe('GET /api/tombolas/:id', () => {
    it('devrait retourner les détails d\'une tombola', async () => {
      const tombola = await createTestTombola({ title: 'TOMBOLA TEST' });

      const response = await request(app)
        .get(`/api/tombolas/${tombola._id}`)
        .expect(200);

      expect(response.body).toHaveProperty('tombola');
      expect(response.body.tombola.title).toBe('TOMBOLA TEST');
    });

    it('devrait échouer avec un ID invalide', async () => {
      const response = await request(app)
        .get('/api/tombolas/invalid_id')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'ID invalide');
    });

    it('devrait échouer avec une tombola inexistante', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // ID MongoDB valide mais inexistant
      
      const response = await request(app)
        .get(`/api/tombolas/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Tombola non trouvée');
    });
  });

  describe('POST /api/tombolas', () => {
    it('devrait créer une nouvelle tombola (admin seulement)', async () => {
      const tombolaData = {
        title: 'NOUVELLE TOMBOLA',
        description: 'Description de la nouvelle tombola',
        prizeAmount: 5000,
        participationPrice: 250,
        maxParticipants: 100,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const response = await request(app)
        .post('/api/tombolas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(tombolaData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Tombola créée avec succès');
      expect(response.body).toHaveProperty('tombola');
      expect(response.body.tombola.title).toBe(tombolaData.title.toUpperCase());
    });

    it('devrait échouer si l\'utilisateur n\'est pas admin', async () => {
      const tombolaData = {
        title: 'NOUVELLE TOMBOLA',
        description: 'Description de la nouvelle tombola',
        prizeAmount: 5000,
        participationPrice: 250,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const response = await request(app)
        .post('/api/tombolas')
        .set('Authorization', `Bearer ${userToken}`)
        .send(tombolaData)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Accès refusé');
    });

    it('devrait échouer avec des données invalides', async () => {
      const tombolaData = {
        title: '', // Titre vide
        description: 'Description',
        prizeAmount: -100, // Montant négatif
        participationPrice: 250,
        endDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Date dans le passé
      };

      const response = await request(app)
        .post('/api/tombolas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(tombolaData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Erreur de validation');
    });
  });

  describe('PUT /api/tombolas/:id', () => {
    it('devrait modifier une tombola (admin seulement)', async () => {
      const tombola = await createTestTombola({ title: 'TOMBOLA ORIGINALE' });

      const updateData = {
        title: 'TOMBOLA MODIFIEE',
        description: 'Nouvelle description',
        prizeAmount: 7500,
        participationPrice: 375,
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      };

      const response = await request(app)
        .put(`/api/tombolas/${tombola._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Tombola mise à jour avec succès');
      expect(response.body.tombola.title).toBe(updateData.title);
    });

    it('devrait échouer si la tombola a déjà des participations', async () => {
      const tombola = await createTestTombola({ title: 'TOMBOLA AVEC PARTICIPATIONS' });
      
      // Simuler des participations
      tombola.totalParticipations = 5;
      await tombola.save();

      const updateData = {
        title: 'TOMBOLA MODIFIEE',
        description: 'Nouvelle description',
        prizeAmount: 7500,
        participationPrice: 375,
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      };

      const response = await request(app)
        .put(`/api/tombolas/${tombola._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Tombola non modifiable');
    });
  });

  describe('DELETE /api/tombolas/:id', () => {
    it('devrait supprimer une tombola (admin seulement)', async () => {
      const tombola = await createTestTombola({ title: 'TOMBOLA A SUPPRIMER' });

      const response = await request(app)
        .delete(`/api/tombolas/${tombola._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Tombola supprimée avec succès');
    });

    it('devrait échouer si la tombola a des participations', async () => {
      const tombola = await createTestTombola({ title: 'TOMBOLA AVEC PARTICIPATIONS' });
      
      // Simuler des participations
      tombola.totalParticipations = 5;
      await tombola.save();

      const response = await request(app)
        .delete(`/api/tombolas/${tombola._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Tombola non supprimable');
    });
  });

  describe('POST /api/tombolas/:id/draw', () => {
    it('devrait effectuer le tirage au sort (admin seulement)', async () => {
      const tombola = await createTestTombola({ 
        title: 'TOMBOLA A TIRER',
        endDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Date dans le passé
      });

      // Simuler des participations validées
      tombola.totalParticipations = 3;
      await tombola.save();

      const response = await request(app)
        .post(`/api/tombolas/${tombola._id}/draw`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Tirage effectué avec succès');
      expect(response.body).toHaveProperty('winner');
    });

    it('devrait échouer si la tombola n\'est pas prête pour le tirage', async () => {
      const tombola = await createTestTombola({ 
        title: 'TOMBOLA PAS PRETE',
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Date dans le futur
      });

      const response = await request(app)
        .post(`/api/tombolas/${tombola._id}/draw`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Tirage impossible');
    });
  });
});

