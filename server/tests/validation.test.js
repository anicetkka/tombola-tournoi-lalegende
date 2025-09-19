const request = require('supertest');
const app = require('../index');
const { createTestUser, createTestTombola, createTestParticipation, generateTestToken } = require('./setup');

describe('Validation des données', () => {
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

  describe('Validation de l\'inscription', () => {
    it('devrait valider un utilisateur avec des données correctes', async () => {
      const validData = {
        phone: '+225012345678',
        fullName: 'TEST USER',
        password: 'Test123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(validData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.phone).toBe(validData.phone);
      expect(response.body.user.fullName).toBe(validData.fullName.toUpperCase());
    });

    it('devrait rejeter un utilisateur avec un numéro de téléphone invalide', async () => {
      const invalidPhones = [
        '012345678', // Format invalide
        '+225123456789', // Trop long
        '+2251234567', // Trop court
        '+226012345678', // Mauvais indicatif
        'abc123456789', // Caractères non numériques
        '', // Vide
        null, // Null
        undefined // Undefined
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

    it('devrait rejeter un utilisateur avec un nom invalide', async () => {
      const invalidNames = [
        '', // Vide
        'A', // Trop court
        'A'.repeat(101), // Trop long
        null, // Null
        undefined, // Undefined
        123, // Numérique
        {}, // Objet
        [] // Tableau
      ];

      for (const name of invalidNames) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            phone: '+225012345678',
            fullName: name,
            password: 'Test123!'
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    it('devrait rejeter un utilisateur avec un mot de passe invalide', async () => {
      const invalidPasswords = [
        '', // Vide
        '123', // Trop court
        'password', // Pas de majuscule ni de chiffre
        'PASSWORD', // Pas de minuscule ni de chiffre
        'Password', // Pas de chiffre
        'password123', // Pas de majuscule
        'PASSWORD123', // Pas de minuscule
        null, // Null
        undefined, // Undefined
        123, // Numérique
        {}, // Objet
        [] // Tableau
      ];

      for (const password of invalidPasswords) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            phone: '+225012345678',
            fullName: 'TEST USER',
            password
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    it('devrait rejeter un utilisateur avec des champs manquants', async () => {
      const missingFields = [
        { fullName: 'TEST USER', password: 'Test123!' }, // Phone manquant
        { phone: '+225012345678', password: 'Test123!' }, // FullName manquant
        { phone: '+225012345678', fullName: 'TEST USER' } // Password manquant
      ];

      for (const data of missingFields) {
        const response = await request(app)
          .post('/api/auth/register')
          .send(data)
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });
  });

  describe('Validation de la connexion', () => {
    beforeEach(async () => {
      await createTestUser({
        phone: '+225012345678',
        fullName: 'TEST USER',
        password: 'Test123!'
      });
    });

    it('devrait valider une connexion avec des identifiants corrects', async () => {
      const validData = {
        phone: '+225012345678',
        password: 'Test123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(validData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('devrait rejeter une connexion avec un numéro de téléphone invalide', async () => {
      const invalidPhones = [
        '012345678', // Format invalide
        '+225123456789', // Trop long
        '+2251234567', // Trop court
        '+226012345678', // Mauvais indicatif
        '', // Vide
        null, // Null
        undefined // Undefined
      ];

      for (const phone of invalidPhones) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            phone,
            password: 'Test123!'
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    it('devrait rejeter une connexion avec un mot de passe invalide', async () => {
      const invalidPasswords = [
        '', // Vide
        null, // Null
        undefined, // Undefined
        123, // Numérique
        {}, // Objet
        [] // Tableau
      ];

      for (const password of invalidPasswords) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            phone: '+225012345678',
            password
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    it('devrait rejeter une connexion avec des champs manquants', async () => {
      const missingFields = [
        { password: 'Test123!' }, // Phone manquant
        { phone: '+225012345678' } // Password manquant
      ];

      for (const data of missingFields) {
        const response = await request(app)
          .post('/api/auth/login')
          .send(data)
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });
  });

  describe('Validation des tombolas', () => {
    it('devrait valider une tombola avec des données correctes', async () => {
      const validData = {
        title: 'TOMBOLA VALIDE',
        description: 'Description de la tombola valide',
        prizeAmount: 10000,
        participationPrice: 500,
        maxParticipants: 100,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const response = await request(app)
        .post('/api/tombolas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validData)
        .expect(201);

      expect(response.body).toHaveProperty('tombola');
      expect(response.body.tombola.title).toBe(validData.title);
    });

    it('devrait rejeter une tombola avec un titre invalide', async () => {
      const invalidTitles = [
        '', // Vide
        'A'.repeat(4), // Trop court
        'A'.repeat(201), // Trop long
        null, // Null
        undefined, // Undefined
        123, // Numérique
        {}, // Objet
        [] // Tableau
      ];

      for (const title of invalidTitles) {
        const response = await request(app)
          .post('/api/tombolas')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            title,
            description: 'Description valide',
            prizeAmount: 10000,
            participationPrice: 500,
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    it('devrait rejeter une tombola avec une description invalide', async () => {
      const invalidDescriptions = [
        '', // Vide
        'A'.repeat(9), // Trop court
        'A'.repeat(1001), // Trop long
        null, // Null
        undefined, // Undefined
        123, // Numérique
        {}, // Objet
        [] // Tableau
      ];

      for (const description of invalidDescriptions) {
        const response = await request(app)
          .post('/api/tombolas')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            title: 'TOMBOLA VALIDE',
            description,
            prizeAmount: 10000,
            participationPrice: 500,
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    it('devrait rejeter une tombola avec des montants invalides', async () => {
      const invalidAmounts = [
        -100, // Négatif
        0, // Zéro
        49, // Trop petit pour la cagnotte
        99, // Trop petit pour la participation
        'abc', // Non numérique
        null, // Null
        undefined, // Undefined
        {}, // Objet
        [] // Tableau
      ];

      for (const amount of invalidAmounts) {
        const response = await request(app)
          .post('/api/tombolas')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            title: 'TOMBOLA VALIDE',
            description: 'Description valide',
            prizeAmount: amount,
            participationPrice: 500,
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    it('devrait rejeter une tombola avec une date de fin invalide', async () => {
      const invalidDates = [
        new Date(Date.now() - 24 * 60 * 60 * 1000), // Date dans le passé
        'invalid_date', // Date invalide
        null, // Null
        undefined, // Undefined
        123, // Numérique
        {}, // Objet
        [] // Tableau
      ];

      for (const date of invalidDates) {
        const response = await request(app)
          .post('/api/tombolas')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            title: 'TOMBOLA VALIDE',
            description: 'Description valide',
            prizeAmount: 10000,
            participationPrice: 500,
            endDate: date
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    it('devrait rejeter une tombola avec des champs manquants', async () => {
      const missingFields = [
        { description: 'Description', prizeAmount: 10000, participationPrice: 500, endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // Title manquant
        { title: 'TOMBOLA', prizeAmount: 10000, participationPrice: 500, endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // Description manquante
        { title: 'TOMBOLA', description: 'Description', participationPrice: 500, endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // PrizeAmount manquant
        { title: 'TOMBOLA', description: 'Description', prizeAmount: 10000, endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // ParticipationPrice manquant
        { title: 'TOMBOLA', description: 'Description', prizeAmount: 10000, participationPrice: 500 } // EndDate manquant
      ];

      for (const data of missingFields) {
        const response = await request(app)
          .post('/api/tombolas')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(data)
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });
  });

  describe('Validation des participations', () => {
    let tombola;

    beforeEach(async () => {
      tombola = await createTestTombola({ title: 'TOMBOLA PARTICIPATION' });
    });

    it('devrait valider une participation avec des données correctes', async () => {
      const validData = {
        tombolaId: tombola._id,
        transactionId: 'TXN123456789',
        paymentPhone: '+225012345678',
        paymentMethod: 'wave',
        amount: tombola.participationPrice
      };

      const response = await request(app)
        .post('/api/participations')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validData)
        .expect(201);

      expect(response.body).toHaveProperty('participation');
      expect(response.body.participation.transactionId).toBe(validData.transactionId.toUpperCase());
    });

    it('devrait rejeter une participation avec un ID de transaction invalide', async () => {
      const invalidTransactionIds = [
        '', // Vide
        'A'.repeat(4), // Trop court
        'A'.repeat(51), // Trop long
        null, // Null
        undefined, // Undefined
        123, // Numérique
        {}, // Objet
        [] // Tableau
      ];

      for (const transactionId of invalidTransactionIds) {
        const response = await request(app)
          .post('/api/participations')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            tombolaId: tombola._id,
            transactionId,
            paymentPhone: '+225012345678',
            paymentMethod: 'wave',
            amount: tombola.participationPrice
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    it('devrait rejeter une participation avec un numéro de téléphone de paiement invalide', async () => {
      const invalidPhones = [
        '012345678', // Format invalide
        '+225123456789', // Trop long
        '+2251234567', // Trop court
        '+226012345678', // Mauvais indicatif
        '', // Vide
        null, // Null
        undefined, // Undefined
        123, // Numérique
        {}, // Objet
        [] // Tableau
      ];

      for (const phone of invalidPhones) {
        const response = await request(app)
          .post('/api/participations')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            tombolaId: tombola._id,
            transactionId: 'TXN123456789',
            paymentPhone: phone,
            paymentMethod: 'wave',
            amount: tombola.participationPrice
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    it('devrait rejeter une participation avec une méthode de paiement invalide', async () => {
      const invalidMethods = [
        'invalid_method', // Méthode invalide
        'paypal', // Méthode non supportée
        '', // Vide
        null, // Null
        undefined, // Undefined
        123, // Numérique
        {}, // Objet
        [] // Tableau
      ];

      for (const method of invalidMethods) {
        const response = await request(app)
          .post('/api/participations')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            tombolaId: tombola._id,
            transactionId: 'TXN123456789',
            paymentPhone: '+225012345678',
            paymentMethod: method,
            amount: tombola.participationPrice
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    it('devrait rejeter une participation avec un montant invalide', async () => {
      const invalidAmounts = [
        -100, // Négatif
        0, // Zéro
        999, // Montant incorrect
        'abc', // Non numérique
        null, // Null
        undefined, // Undefined
        {}, // Objet
        [] // Tableau
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

    it('devrait rejeter une participation avec des champs manquants', async () => {
      const missingFields = [
        { transactionId: 'TXN123456789', paymentPhone: '+225012345678', paymentMethod: 'wave', amount: tombola.participationPrice }, // TombolaId manquant
        { tombolaId: tombola._id, paymentPhone: '+225012345678', paymentMethod: 'wave', amount: tombola.participationPrice }, // TransactionId manquant
        { tombolaId: tombola._id, transactionId: 'TXN123456789', paymentMethod: 'wave', amount: tombola.participationPrice }, // PaymentPhone manquant
        { tombolaId: tombola._id, transactionId: 'TXN123456789', paymentPhone: '+225012345678', amount: tombola.participationPrice }, // PaymentMethod manquant
        { tombolaId: tombola._id, transactionId: 'TXN123456789', paymentPhone: '+225012345678', paymentMethod: 'wave' } // Amount manquant
      ];

      for (const data of missingFields) {
        const response = await request(app)
          .post('/api/participations')
          .set('Authorization', `Bearer ${userToken}`)
          .send(data)
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });
  });

  describe('Validation des actions admin', () => {
    let participation;

    beforeEach(async () => {
      const tombola = await createTestTombola({ title: 'TOMBOLA ADMIN' });
      participation = await createTestParticipation({
        userId: regularUser._id,
        tombolaId: tombola._id,
        status: 'pending'
      });
    });

    it('devrait valider une action admin avec des données correctes', async () => {
      const validActions = ['validate', 'reject'];

      for (const action of validActions) {
        const response = await request(app)
          .put(`/api/participations/${participation._id}/validate`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ action, notes: 'Notes de validation' })
          .expect(200);

        expect(response.body).toHaveProperty('participation');
      }
    });

    it('devrait rejeter une action admin avec une action invalide', async () => {
      const invalidActions = [
        'invalid_action', // Action invalide
        'approve', // Action non supportée
        '', // Vide
        null, // Null
        undefined, // Undefined
        123, // Numérique
        {}, // Objet
        [] // Tableau
      ];

      for (const action of invalidActions) {
        const response = await request(app)
          .put(`/api/participations/${participation._id}/validate`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ action, notes: 'Notes de validation' })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    it('devrait rejeter une action admin avec des notes trop longues', async () => {
      const longNotes = 'A'.repeat(501); // Trop long

      const response = await request(app)
        .put(`/api/participations/${participation._id}/validate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'validate', notes: longNotes })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});