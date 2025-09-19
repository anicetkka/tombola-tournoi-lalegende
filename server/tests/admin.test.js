const request = require('supertest');
const app = require('../index');
const { createTestUser, createTestTombola, createTestParticipation, generateTestToken } = require('./setup');

describe('Administration', () => {
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

  describe('GET /api/admin/dashboard', () => {
    beforeEach(async () => {
      // Créer des données de test
      await createTestTombola({ title: 'TOMBOLA 1' });
      await createTestTombola({ title: 'TOMBOLA 2' });
      
      const tombola = await createTestTombola({ title: 'TOMBOLA 3' });
      await createTestParticipation({
        userId: regularUser._id,
        tombolaId: tombola._id,
        status: 'pending'
      });
    });

    it('devrait retourner les données du tableau de bord (admin seulement)', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('totalUsers');
      expect(response.body.stats).toHaveProperty('totalTombolas');
      expect(response.body.stats).toHaveProperty('totalParticipations');
      expect(response.body.stats).toHaveProperty('totalRevenue');
      expect(response.body).toHaveProperty('recentTombolas');
      expect(response.body).toHaveProperty('pendingParticipations');
      expect(response.body).toHaveProperty('readyForDraw');
    });

    it('devrait échouer si l\'utilisateur n\'est pas admin', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Accès refusé');
    });

    it('devrait échouer sans authentification', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Accès refusé');
    });
  });

  describe('GET /api/admin/users', () => {
    beforeEach(async () => {
      // Créer quelques utilisateurs de test
      await createTestUser({ phone: '+225111111111', fullName: 'USER 1' });
      await createTestUser({ phone: '+225222222222', fullName: 'USER 2' });
      await createTestUser({ phone: '+225333333333', fullName: 'USER 3', isActive: false });
    });

    it('devrait retourner la liste des utilisateurs (admin seulement)', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(response.body.users.length).toBeGreaterThan(0);
      expect(response.body).toHaveProperty('pagination');
    });

    it('devrait filtrer les utilisateurs par rôle', async () => {
      const response = await request(app)
        .get('/api/admin/users?role=user')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.users.every(user => user.role === 'user')).toBe(true);
    });

    it('devrait filtrer les utilisateurs par statut actif', async () => {
      const response = await request(app)
        .get('/api/admin/users?isActive=false')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.users.every(user => !user.isActive)).toBe(true);
    });
  });

  describe('PUT /api/admin/users/:id/toggle-status', () => {
    let targetUser;

    beforeEach(async () => {
      targetUser = await createTestUser({ 
        phone: '+225444444444', 
        fullName: 'TARGET USER',
        isActive: true
      });
    });

    it('devrait désactiver un utilisateur (admin seulement)', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${targetUser._id}/toggle-status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Utilisateur désactivé avec succès');
      expect(response.body.user.isActive).toBe(false);
    });

    it('devrait activer un utilisateur inactif (admin seulement)', async () => {
      // Désactiver l'utilisateur d'abord
      targetUser.isActive = false;
      await targetUser.save();

      const response = await request(app)
        .put(`/api/admin/users/${targetUser._id}/toggle-status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Utilisateur activé avec succès');
      expect(response.body.user.isActive).toBe(true);
    });

    it('devrait échouer si l\'admin essaie de se désactiver lui-même', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${adminUser._id}/toggle-status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Action non autorisée');
    });

    it('devrait échouer si l\'utilisateur n\'est pas admin', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${targetUser._id}/toggle-status`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Accès refusé');
    });
  });

  describe('PUT /api/admin/users/:id/reset-password', () => {
    let targetUser;

    beforeEach(async () => {
      targetUser = await createTestUser({ 
        phone: '+225555555555', 
        fullName: 'PASSWORD USER'
      });
    });

    it('devrait réinitialiser le mot de passe d\'un utilisateur (admin seulement)', async () => {
      const newPassword = 'NewPassword123!';

      const response = await request(app)
        .put(`/api/admin/users/${targetUser._id}/reset-password`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ newPassword })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Mot de passe réinitialisé avec succès');
      expect(response.body.user.id).toBe(targetUser._id.toString());
    });

    it('devrait échouer avec un mot de passe trop court', async () => {
      const newPassword = '123'; // Trop court

      const response = await request(app)
        .put(`/api/admin/users/${targetUser._id}/reset-password`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ newPassword })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Mot de passe invalide');
    });

    it('devrait échouer si l\'utilisateur n\'est pas admin', async () => {
      const newPassword = 'NewPassword123!';

      const response = await request(app)
        .put(`/api/admin/users/${targetUser._id}/reset-password`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ newPassword })
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Accès refusé');
    });
  });

  describe('GET /api/admin/stats/detailed', () => {
    beforeEach(async () => {
      // Créer des données de test pour les statistiques
      await createTestTombola({ title: 'TOMBOLA 1', status: 'active' });
      await createTestTombola({ title: 'TOMBOLA 2', status: 'ended' });
      await createTestTombola({ title: 'TOMBOLA 3', status: 'drawn' });
      
      const tombola = await createTestTombola({ title: 'TOMBOLA 4' });
      await createTestParticipation({
        userId: regularUser._id,
        tombolaId: tombola._id,
        status: 'validated',
        amount: 500
      });
    });

    it('devrait retourner les statistiques détaillées (admin seulement)', async () => {
      const response = await request(app)
        .get('/api/admin/stats/detailed')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('userStats');
      expect(response.body).toHaveProperty('tombolaStats');
      expect(response.body).toHaveProperty('monthlyStats');
      expect(response.body).toHaveProperty('topUsers');
    });

    it('devrait filtrer les statistiques par date', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const response = await request(app)
        .get(`/api/admin/stats/detailed?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('userStats');
      expect(response.body).toHaveProperty('tombolaStats');
    });

    it('devrait échouer si l\'utilisateur n\'est pas admin', async () => {
      const response = await request(app)
        .get('/api/admin/stats/detailed')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Accès refusé');
    });
  });

  describe('GET /api/admin/export/participations', () => {
    beforeEach(async () => {
      // Créer des participations de test
      const tombola = await createTestTombola({ title: 'TOMBOLA EXPORT' });
      await createTestParticipation({
        userId: regularUser._id,
        tombolaId: tombola._id,
        status: 'validated',
        transactionId: 'TXN001'
      });
      await createTestParticipation({
        userId: regularUser._id,
        tombolaId: tombola._id,
        status: 'pending',
        transactionId: 'TXN002'
      });
    });

    it('devrait exporter les participations (admin seulement)', async () => {
      const response = await request(app)
        .get('/api/admin/export/participations')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('exportedAt');
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('devrait filtrer l\'export par statut', async () => {
      const response = await request(app)
        .get('/api/admin/export/participations?status=validated')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.every(p => p.statut === 'validated')).toBe(true);
    });

    it('devrait filtrer l\'export par tombola', async () => {
      const tombola = await createTestTombola({ title: 'TOMBOLA FILTER' });
      
      const response = await request(app)
        .get(`/api/admin/export/participations?tombolaId=${tombola._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.every(p => p.tombola === tombola.title)).toBe(true);
    });

    it('devrait échouer si l\'utilisateur n\'est pas admin', async () => {
      const response = await request(app)
        .get('/api/admin/export/participations')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Accès refusé');
    });
  });
});

