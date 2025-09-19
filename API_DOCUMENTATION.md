# Documentation API - Tombola Côte d'Ivoire

## Base URL
```
http://localhost:5000/api
```

## Authentification
L'API utilise JWT (JSON Web Tokens) pour l'authentification. Incluez le token dans l'en-tête Authorization :
```
Authorization: Bearer <token>
```

## Endpoints

### Authentification

#### POST /auth/register
Inscription d'un nouvel utilisateur.

**Body:**
```json
{
  "phone": "+225XXXXXXXX",
  "fullName": "NOM PRENOM",
  "password": "motdepasse123"
}
```

**Response:**
```json
{
  "message": "Inscription réussie",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "phone": "+225XXXXXXXX",
    "fullName": "NOM PRENOM",
    "role": "user",
    "totalParticipations": 0
  }
}
```

#### POST /auth/login
Connexion d'un utilisateur.

**Body:**
```json
{
  "phone": "+225XXXXXXXX",
  "password": "motdepasse123"
}
```

**Response:**
```json
{
  "message": "Connexion réussie",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "phone": "+225XXXXXXXX",
    "fullName": "NOM PRENOM",
    "role": "user",
    "totalParticipations": 0
  }
}
```

#### GET /auth/verify
Vérifier la validité du token.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": "user_id",
    "phone": "+225XXXXXXXX",
    "fullName": "NOM PRENOM",
    "role": "user"
  }
}
```

### Utilisateurs

#### GET /users/profile
Obtenir le profil de l'utilisateur connecté.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "phone": "+225XXXXXXXX",
    "fullName": "NOM PRENOM",
    "role": "user",
    "totalParticipations": 5,
    "participationsByTombola": [
      {
        "tombolaId": "tombola_id",
        "count": 2
      }
    ]
  },
  "stats": {
    "participationStats": [
      {
        "_id": "validated",
        "count": 3,
        "totalAmount": 1500
      }
    ]
  }
}
```

#### PUT /users/profile
Mettre à jour le profil utilisateur.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "fullName": "NOUVEAU NOM"
}
```

#### PUT /users/change-password
Changer le mot de passe.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "currentPassword": "ancien_mot_de_passe",
  "newPassword": "nouveau_mot_de_passe"
}
```

#### GET /users/participations
Obtenir les participations de l'utilisateur.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optionnel): Numéro de page
- `limit` (optionnel): Nombre d'éléments par page
- `status` (optionnel): Filtrer par statut
- `tombolaId` (optionnel): Filtrer par tombola

### Tombolas

#### GET /tombolas
Obtenir la liste des tombolas.

**Query Parameters:**
- `page` (optionnel): Numéro de page
- `limit` (optionnel): Nombre d'éléments par page
- `status` (optionnel): Filtrer par statut

**Response:**
```json
{
  "tombolas": [
    {
      "id": "tombola_id",
      "title": "TOMBOLA SPECIALE",
      "description": "Description de la tombola",
      "prizeAmount": 10000,
      "participationPrice": 500,
      "maxParticipants": null,
      "endDate": "2024-12-31T23:59:59.000Z",
      "status": "active",
      "isDrawn": false,
      "totalParticipations": 15,
      "totalRevenue": 7500,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "canParticipate": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

#### GET /tombolas/:id
Obtenir les détails d'une tombola.

**Response:**
```json
{
  "tombola": {
    "id": "tombola_id",
    "title": "TOMBOLA SPECIALE",
    "description": "Description de la tombola",
    "prizeAmount": 10000,
    "participationPrice": 500,
    "maxParticipants": null,
    "endDate": "2024-12-31T23:59:59.000Z",
    "status": "active",
    "isDrawn": false,
    "totalParticipations": 15,
    "totalRevenue": 7500,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "canParticipate": true
  }
}
```

#### POST /tombolas (Admin seulement)
Créer une nouvelle tombola.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "title": "NOUVELLE TOMBOLA",
  "description": "Description de la nouvelle tombola",
  "prizeAmount": 5000,
  "participationPrice": 250,
  "maxParticipants": 100,
  "endDate": "2024-12-31T23:59:59.000Z"
}
```

#### PUT /tombolas/:id (Admin seulement)
Modifier une tombola.

**Headers:**
```
Authorization: Bearer <admin_token>
```

#### DELETE /tombolas/:id (Admin seulement)
Supprimer une tombola.

**Headers:**
```
Authorization: Bearer <admin_token>
```

#### POST /tombolas/:id/draw (Admin seulement)
Effectuer le tirage au sort d'une tombola.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "message": "Tirage effectué avec succès",
  "tombola": {
    "id": "tombola_id",
    "isDrawn": true,
    "status": "drawn",
    "drawDate": "2024-01-15T10:30:00.000Z"
  },
  "winner": {
    "id": "participation_id",
    "user": {
      "id": "user_id",
      "fullName": "GAGNANT NOM",
      "phone": "+225XXXXXXXX"
    },
    "transactionId": "TXN123456789",
    "amount": 500
  }
}
```

### Participations

#### POST /participations
Créer une nouvelle participation.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "tombolaId": "tombola_id",
  "transactionId": "TXN123456789",
  "paymentPhone": "+225XXXXXXXX",
  "paymentMethod": "wave",
  "amount": 500
}
```

**Response:**
```json
{
  "message": "Participation soumise avec succès",
  "participation": {
    "id": "participation_id",
    "tombolaId": "tombola_id",
    "transactionId": "TXN123456789",
    "paymentMethod": "wave",
    "amount": 500,
    "status": "pending",
    "isWinner": false,
    "createdAt": "2024-01-01T10:00:00.000Z"
  },
  "instructions": {
    "status": "En attente de validation",
    "message": "Votre participation est en cours de validation par l'administrateur. Vous recevrez une confirmation dans les 24-48h.",
    "nextSteps": [
      "1. Vérifiez que votre paiement a bien été effectué",
      "2. Attendez la validation de l'administrateur",
      "3. Consultez votre profil pour suivre le statut"
    ]
  }
}
```

#### GET /participations (Admin seulement)
Obtenir toutes les participations.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optionnel): Numéro de page
- `limit` (optionnel): Nombre d'éléments par page
- `status` (optionnel): Filtrer par statut
- `tombolaId` (optionnel): Filtrer par tombola
- `userId` (optionnel): Filtrer par utilisateur

#### PUT /participations/:id/validate (Admin seulement)
Valider ou rejeter une participation.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "action": "validate", // ou "reject"
  "notes": "Notes optionnelles"
}
```

### Administration

#### GET /admin/dashboard (Admin seulement)
Obtenir les données du tableau de bord administrateur.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "stats": {
    "totalUsers": 150,
    "totalTombolas": 5,
    "totalParticipations": 300,
    "totalRevenue": 150000,
    "participationStats": [
      {
        "_id": "validated",
        "count": 250,
        "totalAmount": 125000
      }
    ]
  },
  "recentTombolas": [...],
  "pendingParticipations": [...],
  "readyForDraw": [...]
}
```

#### GET /admin/users (Admin seulement)
Obtenir la liste des utilisateurs.

**Headers:**
```
Authorization: Bearer <admin_token>
```

#### PUT /admin/users/:id/toggle-status (Admin seulement)
Activer/désactiver un utilisateur.

**Headers:**
```
Authorization: Bearer <admin_token>
```

#### PUT /admin/users/:id/reset-password (Admin seulement)
Réinitialiser le mot de passe d'un utilisateur.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "newPassword": "nouveau_mot_de_passe"
}
```

## Codes d'erreur

### 400 - Bad Request
Erreur de validation des données.

**Response:**
```json
{
  "error": "Erreur de validation",
  "details": [
    {
      "field": "phone",
      "message": "Format de numéro ivoirien invalide",
      "value": "invalid_phone"
    }
  ]
}
```

### 401 - Unauthorized
Token manquant ou invalide.

**Response:**
```json
{
  "error": "Accès refusé",
  "message": "Token d'authentification requis"
}
```

### 403 - Forbidden
Droits insuffisants.

**Response:**
```json
{
  "error": "Accès refusé",
  "message": "Droits d'administrateur requis"
}
```

### 404 - Not Found
Ressource non trouvée.

**Response:**
```json
{
  "error": "Tombola non trouvée",
  "message": "Aucune tombola trouvée avec cet ID"
}
```

### 500 - Internal Server Error
Erreur serveur.

**Response:**
```json
{
  "error": "Erreur interne du serveur",
  "message": "Une erreur est survenue"
}
```

## Exemples d'utilisation

### Inscription et participation complète

```javascript
// 1. Inscription
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '+225012345678',
    fullName: 'DUPONT JEAN',
    password: 'MotDePasse123'
  })
});

const { token } = await registerResponse.json();

// 2. Obtenir les tombolas
const tombolasResponse = await fetch('/api/tombolas', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { tombolas } = await tombolasResponse.json();

// 3. Participer à une tombola
const participationResponse = await fetch('/api/participations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    tombolaId: tombolas[0].id,
    transactionId: 'TXN123456789',
    paymentPhone: '+225012345678',
    paymentMethod: 'wave',
    amount: tombolas[0].participationPrice
  })
});
```

### Administration

```javascript
// 1. Connexion admin
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '+225000000000',
    password: 'admin_password'
  })
});

const { token } = await loginResponse.json();

// 2. Obtenir le tableau de bord
const dashboardResponse = await fetch('/api/admin/dashboard', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const dashboardData = await dashboardResponse.json();

// 3. Valider une participation
const validateResponse = await fetch(`/api/participations/${participationId}/validate`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    action: 'validate',
    notes: 'Paiement vérifié'
  })
});
```

