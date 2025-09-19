const request = require('supertest');
const app = require('../index');
const { createTestUser, createTestTombola, createTestParticipation, generateTestToken } = require('./setup');

describe('Intégration - Flux complet', () => {
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
  });

  describe('Flux complet de participation', () => {
    it('devrait permettre le flux complet : création tombola -> participation -> validation -> tirage', async () => {
      // 1. Créer une tombola (admin)
      const tombolaData = {
        title: 'TOMBOLA INTEGRATION',
        description: 'Tombola de test d\'intégration',
        prizeAmount: 10000,
        participationPrice: 500,
        maxParticipants: 5,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const createTombolaResponse = await request(app)
        .post('/api/tombolas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(tombolaData)
        .expect(201);

      const createdTombola = createTombolaResponse.body.tombola;

      // 2. Participer à la tombola (utilisateur)
      const participationData = {
        tombolaId: createdTombola.id,
        transactionId: 'TXN123456789',
        paymentPhone: '+225012345678',
        paymentMethod: 'wave',
        amount: tombolaData.participationPrice
      };

      const participationResponse = await request(app)
        .post('/api/participations')
        .set('Authorization', `Bearer ${userToken}`)
        .send(participationData)
        .expect(201);

      const participation = participationResponse.body.participation;

      // 3. Vérifier que la participation est en attente
      expect(participation.status).toBe('pending');

      // 4. Valider la participation (admin)
      const validateResponse = await request(app)
        .put(`/api/participations/${participation.id}/validate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'validate', notes: 'Paiement vérifié' })
        .expect(200);

      expect(validateResponse.body.participation.status).toBe('validated');

      // 5. Vérifier que l'utilisateur peut voir sa participation validée
      const userParticipationsResponse = await request(app)
        .get('/api/users/participations')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const userParticipations = userParticipationsResponse.body.participations;
      const validatedParticipation = userParticipations.find(p => p.id === participation.id);
      expect(validatedParticipation.status).toBe('validated');

      // 6. Modifier la tombola pour qu'elle soit prête pour le tirage
      const updateTombolaResponse = await request(app)
        .put(`/api/tombolas/${createdTombola.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...tombolaData,
          endDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Date dans le passé
        })
        .expect(200);

      // 7. Effectuer le tirage (admin)
      const drawResponse = await request(app)
        .post(`/api/tombolas/${createdTombola.id}/draw`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(drawResponse.body).toHaveProperty('winner');
      expect(drawResponse.body.tombola.isDrawn).toBe(true);

      // 8. Vérifier que la participation est marquée comme terminée
      const finalParticipationsResponse = await request(app)
        .get('/api/users/participations')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const finalParticipations = finalParticipationsResponse.body.participations;
      const finalParticipation = finalParticipations.find(p => p.id === participation.id);
      expect(finalParticipation.status).toBe('completed');
    });

    it('devrait gérer le rejet d\'une participation', async () => {
      // 1. Créer une tombola
      const tombola = await createTestTombola({ title: 'TOMBOLA REJET' });

      // 2. Créer une participation
      const participation = await createTestParticipation({
        userId: regularUser._id,
        tombolaId: tombola._id,
        status: 'pending'
      });

      // 3. Rejeter la participation (admin)
      const rejectResponse = await request(app)
        .put(`/api/participations/${participation._id}/validate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'reject', notes: 'Paiement non trouvé' })
        .expect(200);

      expect(rejectResponse.body.participation.status).toBe('rejected');

      // 4. Vérifier que l'utilisateur peut voir sa participation rejetée
      const userParticipationsResponse = await request(app)
        .get('/api/users/participations')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const userParticipations = userParticipationsResponse.body.participations;
      const rejectedParticipation = userParticipations.find(p => p.id === participation._id.toString());
      expect(rejectedParticipation.status).toBe('rejected');
    });

    it('devrait gérer plusieurs participations d\'un même utilisateur', async () => {
      // 1. Créer une tombola
      const tombola = await createTestTombola({ title: 'TOMBOLA MULTIPLE' });

      // 2. Créer plusieurs participations pour le même utilisateur
      const participation1 = await createTestParticipation({
        userId: regularUser._id,
        tombolaId: tombola._id,
        transactionId: 'TXN001',
        status: 'pending'
      });

      const participation2 = await createTestParticipation({
        userId: regularUser._id,
        tombolaId: tombola._id,
        transactionId: 'TXN002',
        status: 'pending'
      });

      // 3. Valider les deux participations
      await request(app)
        .put(`/api/participations/${participation1._id}/validate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'validate', notes: 'Paiement 1 vérifié' })
        .expect(200);

      await request(app)
        .put(`/api/participations/${participation2._id}/validate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'validate', notes: 'Paiement 2 vérifié' })
        .expect(200);

      // 4. Vérifier que l'utilisateur a 2 participations validées
      const userParticipationsResponse = await request(app)
        .get('/api/users/participations')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const userParticipations = userParticipationsResponse.body.participations;
      const validatedParticipations = userParticipations.filter(p => p.status === 'validated');
      expect(validatedParticipations).toHaveLength(2);

      // 5. Vérifier que le compteur de participations de l'utilisateur est mis à jour
      const userProfileResponse = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(userProfileResponse.body.user.totalParticipations).toBe(2);
    });
  });

  describe('Gestion des erreurs et cas limites', () => {
    it('devrait gérer les tentatives de participation avec des données invalides', async () => {
      const tombola = await createTestTombola({ title: 'TOMBOLA ERREURS' });

      // Tentative avec un montant incorrect
      const invalidAmountResponse = await request(app)
        .post('/api/participations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          tombolaId: tombola._id,
          transactionId: 'TXN123456789',
          paymentPhone: '+225012345678',
          paymentMethod: 'wave',
          amount: 999 // Montant incorrect
        })
        .expect(400);

      expect(invalidAmountResponse.body).toHaveProperty('error', 'Montant incorrect');

      // Tentative avec un ID de transaction déjà utilisé
      await createTestParticipation({
        userId: regularUser._id,
        tombolaId: tombola._id,
        transactionId: 'TXN123456789'
      });

      const duplicateTransactionResponse = await request(app)
        .post('/api/participations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          tombolaId: tombola._id,
          transactionId: 'TXN123456789', // Même ID
          paymentPhone: '+225012345678',
          paymentMethod: 'wave',
          amount: tombola.participationPrice
        })
        .expect(400);

      expect(duplicateTransactionResponse.body).toHaveProperty('error', 'Transaction déjà utilisée');
    });

    it('devrait gérer les tentatives d\'accès non autorisées', async () => {
      const tombola = await createTestTombola({ title: 'TOMBOLA SECURITE' });

      // Tentative de création de tombola par un utilisateur non-admin
      const createTombolaResponse = await request(app)
        .post('/api/tombolas')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'TOMBOLA NON AUTORISEE',
          description: 'Test',
          prizeAmount: 1000,
          participationPrice: 100,
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })
        .expect(403);

      expect(createTombolaResponse.body).toHaveProperty('error', 'Accès refusé');

      // Tentative d\'accès au tableau de bord admin
      const dashboardResponse = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(dashboardResponse.body).toHaveProperty('error', 'Accès refusé');
    });

    it('devrait gérer les tentatives de modification de tombolas avec des participations', async () => {
      // 1. Créer une tombola
      const tombola = await createTestTombola({ title: 'TOMBOLA MODIFICATION' });

      // 2. Créer une participation
      await createTestParticipation({
        userId: regularUser._id,
        tombolaId: tombola._id,
        status: 'validated'
      });

      // 3. Tentative de modification de la tombola
      const modifyResponse = await request(app)
        .put(`/api/tombolas/${tombola._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'TOMBOLA MODIFIEE',
          description: 'Nouvelle description',
          prizeAmount: 2000,
          participationPrice: 200,
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        })
        .expect(400);

      expect(modifyResponse.body).toHaveProperty('error', 'Tombola non modifiable');

      // 4. Tentative de suppression de la tombola
      const deleteResponse = await request(app)
        .delete(`/api/tombolas/${tombola._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(deleteResponse.body).toHaveProperty('error', 'Tombola non supprimable');
    });
  });

  describe('Performance et limites', () => {
    it('devrait gérer un grand nombre de participations', async () => {
      const tombola = await createTestTombola({ title: 'TOMBOLA PERFORMANCE' });

      // Créer plusieurs utilisateurs et participations
      const users = [];
      const participations = [];

      for (let i = 0; i < 10; i++) {
        const user = await createTestUser({ 
          phone: `+22500000000${i}`,
          fullName: `USER ${i}`
        });
        users.push(user);

        const participation = await createTestParticipation({
          userId: user._id,
          tombolaId: tombola._id,
          transactionId: `TXN${i.toString().padStart(3, '0')}`,
          status: 'validated'
        });
        participations.push(participation);
      }

      // Vérifier que toutes les participations sont créées
      const allParticipationsResponse = await request(app)
        .get('/api/participations')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(allParticipationsResponse.body.participations.length).toBeGreaterThanOrEqual(10);

      // Vérifier que le tirage fonctionne avec plusieurs participations
      const drawResponse = await request(app)
        .post(`/api/tombolas/${tombola._id}/draw`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(drawResponse.body).toHaveProperty('winner');
      expect(drawResponse.body.tombola.isDrawn).toBe(true);
    });
  });
});

