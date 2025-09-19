const request = require('supertest');
const app = require('../index');
const { createTestUser, createTestTombola, createTestParticipation, generateTestToken } = require('./setup');

describe('Performance et limites', () => {
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

  describe('Tests de charge', () => {
    it('devrait gérer 100 requêtes simultanées sur l\'API des tombolas', async () => {
      const tombola = await createTestTombola({ title: 'TOMBOLA CHARGE' });

      // Créer 100 requêtes simultanées
      const requests = Array.from({ length: 100 }, () =>
        request(app)
          .get(`/api/tombolas/${tombola._id}`)
          .expect(200)
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const endTime = Date.now();

      // Vérifier que toutes les requêtes ont réussi
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('tombola');
      });

      // Vérifier que le temps de réponse est acceptable (moins de 5 secondes)
      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(5000);

      console.log(`100 requêtes simultanées traitées en ${responseTime}ms`);
    });

    it('devrait gérer la création de 50 participations rapidement', async () => {
      const tombola = await createTestTombola({ title: 'TOMBOLA RAPIDITE' });

      // Créer 50 utilisateurs
      const users = [];
      for (let i = 0; i < 50; i++) {
        const user = await createTestUser({ 
          phone: `+22500000000${i.toString().padStart(2, '0')}`,
          fullName: `USER ${i}`
        });
        users.push(user);
      }

      // Créer 50 participations simultanément
      const participationRequests = users.map((user, index) => {
        const userToken = generateTestToken(user._id);
        return request(app)
          .post('/api/participations')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            tombolaId: tombola._id,
            transactionId: `TXN${index.toString().padStart(3, '0')}`,
            paymentPhone: user.phone,
            paymentMethod: 'wave',
            amount: tombola.participationPrice
          });
      });

      const startTime = Date.now();
      const responses = await Promise.all(participationRequests);
      const endTime = Date.now();

      // Vérifier que toutes les participations ont été créées
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('participation');
      });

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(10000); // Moins de 10 secondes

      console.log(`50 participations créées en ${responseTime}ms`);
    });
  });

  describe('Tests de mémoire', () => {
    it('devrait gérer la création de 1000 utilisateurs sans problème de mémoire', async () => {
      const startMemory = process.memoryUsage();

      // Créer 1000 utilisateurs
      const users = [];
      for (let i = 0; i < 1000; i++) {
        const user = await createTestUser({ 
          phone: `+22500000000${i.toString().padStart(3, '0')}`,
          fullName: `USER ${i}`
        });
        users.push(user);
      }

      const endMemory = process.memoryUsage();
      const memoryIncrease = endMemory.heapUsed - startMemory.heapUsed;

      // Vérifier que l'augmentation de mémoire est raisonnable (moins de 100MB)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);

      console.log(`Mémoire utilisée pour 1000 utilisateurs: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    });

    it('devrait gérer la création de 1000 tombolas sans problème de mémoire', async () => {
      const startMemory = process.memoryUsage();

      // Créer 1000 tombolas
      const tombolas = [];
      for (let i = 0; i < 1000; i++) {
        const tombola = await createTestTombola({ 
          title: `TOMBOLA ${i}`,
          description: `Description de la tombola ${i}`
        });
        tombolas.push(tombola);
      }

      const endMemory = process.memoryUsage();
      const memoryIncrease = endMemory.heapUsed - startMemory.heapUsed;

      // Vérifier que l'augmentation de mémoire est raisonnable (moins de 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);

      console.log(`Mémoire utilisée pour 1000 tombolas: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    });
  });

  describe('Tests de pagination', () => {
    it('devrait gérer la pagination avec un grand nombre de tombolas', async () => {
      // Créer 100 tombolas
      for (let i = 0; i < 100; i++) {
        await createTestTombola({ 
          title: `TOMBOLA PAGINATION ${i}`,
          description: `Description ${i}`
        });
      }

      // Tester la première page
      const firstPageResponse = await request(app)
        .get('/api/tombolas?page=1&limit=10')
        .expect(200);

      expect(firstPageResponse.body.tombolas).toHaveLength(10);
      expect(firstPageResponse.body.pagination.page).toBe(1);
      expect(firstPageResponse.body.pagination.limit).toBe(10);
      expect(firstPageResponse.body.pagination.total).toBeGreaterThanOrEqual(100);

      // Tester la dernière page
      const lastPageResponse = await request(app)
        .get('/api/tombolas?page=10&limit=10')
        .expect(200);

      expect(lastPageResponse.body.pagination.page).toBe(10);
      expect(lastPageResponse.body.pagination.pages).toBeGreaterThanOrEqual(10);
    });

    it('devrait gérer la pagination avec un grand nombre de participations', async () => {
      const tombola = await createTestTombola({ title: 'TOMBOLA PAGINATION PARTICIPATIONS' });

      // Créer 100 participations
      for (let i = 0; i < 100; i++) {
        const user = await createTestUser({ 
          phone: `+22500000000${i.toString().padStart(2, '0')}`,
          fullName: `USER ${i}`
        });
        
        await createTestParticipation({
          userId: user._id,
          tombolaId: tombola._id,
          transactionId: `TXN${i.toString().padStart(3, '0')}`,
          status: 'validated'
        });
      }

      // Tester la première page
      const firstPageResponse = await request(app)
        .get('/api/participations?page=1&limit=20')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(firstPageResponse.body.participations).toHaveLength(20);
      expect(firstPageResponse.body.pagination.page).toBe(1);
      expect(firstPageResponse.body.pagination.limit).toBe(20);
      expect(firstPageResponse.body.pagination.total).toBeGreaterThanOrEqual(100);
    });
  });

  describe('Tests de validation des données', () => {
    it('devrait valider rapidement un grand nombre de participations', async () => {
      const tombola = await createTestTombola({ title: 'TOMBOLA VALIDATION' });

      // Créer 100 participations en attente
      const participations = [];
      for (let i = 0; i < 100; i++) {
        const user = await createTestUser({ 
          phone: `+22500000000${i.toString().padStart(2, '0')}`,
          fullName: `USER ${i}`
        });
        
        const participation = await createTestParticipation({
          userId: user._id,
          tombolaId: tombola._id,
          transactionId: `TXN${i.toString().padStart(3, '0')}`,
          status: 'pending'
        });
        
        participations.push(participation);
      }

      // Valider toutes les participations
      const startTime = Date.now();
      const validationRequests = participations.map(participation =>
        request(app)
          .put(`/api/participations/${participation._id}/validate`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ action: 'validate', notes: 'Validation rapide' })
      );

      const responses = await Promise.all(validationRequests);
      const endTime = Date.now();

      // Vérifier que toutes les validations ont réussi
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.participation.status).toBe('validated');
      });

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(15000); // Moins de 15 secondes

      console.log(`100 participations validées en ${responseTime}ms`);
    });
  });

  describe('Tests de concurrence', () => {
    it('devrait gérer les accès concurrents à la même tombola', async () => {
      const tombola = await createTestTombola({ title: 'TOMBOLA CONCURRENCE' });

      // Créer 50 utilisateurs
      const users = [];
      for (let i = 0; i < 50; i++) {
        const user = await createTestUser({ 
          phone: `+22500000000${i.toString().padStart(2, '0')}`,
          fullName: `USER ${i}`
        });
        users.push(user);
      }

      // Tous les utilisateurs essaient de participer en même temps
      const participationRequests = users.map((user, index) => {
        const userToken = generateTestToken(user._id);
        return request(app)
          .post('/api/participations')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            tombolaId: tombola._id,
            transactionId: `TXN${index.toString().padStart(3, '0')}`,
            paymentPhone: user.phone,
            paymentMethod: 'wave',
            amount: tombola.participationPrice
          });
      });

      const responses = await Promise.all(participationRequests);

      // Vérifier que toutes les participations ont été créées
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('participation');
      });

      // Vérifier qu'il n'y a pas de doublons
      const allParticipationsResponse = await request(app)
        .get('/api/participations')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const transactionIds = allParticipationsResponse.body.participations
        .filter(p => p.tombolaId === tombola._id.toString())
        .map(p => p.transactionId);

      const uniqueTransactionIds = [...new Set(transactionIds)];
      expect(uniqueTransactionIds.length).toBe(transactionIds.length);
    });
  });
});