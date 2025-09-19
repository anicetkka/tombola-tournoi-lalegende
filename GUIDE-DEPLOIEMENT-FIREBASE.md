# 🚀 Guide de Déploiement sur Firebase

## 📋 Prérequis

1. **Compte Google** avec accès à Firebase
2. **Node.js** installé (version 18+)
3. **MongoDB Atlas** (base de données cloud gratuite)

## 🔧 Configuration Initiale

### 1. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Créer un projet"
3. Nommez votre projet : `tombola-cote-ivoire`
4. Activez Google Analytics (optionnel)
5. Créez le projet

### 2. Configurer MongoDB Atlas (Base de données gratuite)

1. Allez sur [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Créez un compte gratuit
3. Créez un cluster gratuit (M0 Sandbox)
4. Créez un utilisateur de base de données
5. Autorisez l'accès depuis n'importe où (0.0.0.0/0)
6. Récupérez la chaîne de connexion

### 3. Configuration des variables d'environnement

1. Copiez `server/functions/config.env.example` vers `server/functions/.env`
2. Modifiez les valeurs :

```env
# Remplacez par votre chaîne de connexion MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/tombola_cote_ivoire?retryWrites=true&w=majority

# Générez une clé JWT sécurisée
JWT_SECRET=votre-cle-jwt-tres-longue-et-securisee-ici

# Configuration admin
ADMIN_PHONE=+2250701234567
ADMIN_PASSWORD=Admin123!
```

## 🚀 Déploiement

### Option 1 : Déploiement automatique

```bash
# Exécutez le script de déploiement
.\deploy-firebase.bat
```

### Option 2 : Déploiement manuel

```bash
# 1. Construire le frontend
cd client
npm run build

# 2. Installer les dépendances du backend
cd ../server/functions
npm install

# 3. Déployer sur Firebase
cd ../..
firebase deploy
```

## 🌐 URLs de Production

Après le déploiement, votre application sera disponible sur :

- **Frontend** : `https://tombola-cote-ivoire.web.app`
- **Backend API** : `https://us-central1-tombola-cote-ivoire.cloudfunctions.net/api`

## 🔐 Configuration de la Base de Données

### Créer l'administrateur

1. Connectez-vous à votre application
2. Allez sur `/admin/dashboard`
3. Utilisez les identifiants configurés dans `.env`

### Données de test

```bash
# Exécuter les scripts de données de test
cd server
node scripts/seedContactMessages.js
```

## 📊 Monitoring et Logs

### Firebase Console

1. **Hosting** : Voir les statistiques de trafic
2. **Functions** : Voir les logs et performances
3. **Analytics** : Voir les statistiques d'utilisation

### Logs en temps réel

```bash
firebase functions:log --follow
```

## 🔧 Maintenance

### Mise à jour de l'application

```bash
# 1. Modifier le code
# 2. Tester localement
# 3. Redéployer
firebase deploy
```

### Sauvegarde de la base de données

MongoDB Atlas effectue des sauvegardes automatiques. Vous pouvez aussi :

1. Exporter les données via MongoDB Compass
2. Utiliser les outils de sauvegarde d'Atlas

## 💰 Coûts

### Gratuit (Limites généreuses)

- **Firebase Hosting** : 10 GB de stockage, 10 GB de transfert/mois
- **Firebase Functions** : 2 millions d'invocations/mois
- **MongoDB Atlas** : 512 MB de stockage, connexions illimitées

### Si vous dépassez les limites

- Firebase : Pay-as-you-go (très abordable)
- MongoDB Atlas : Plans à partir de 9$/mois

## 🆘 Dépannage

### Erreurs courantes

1. **Erreur de connexion MongoDB**
   - Vérifiez la chaîne de connexion
   - Vérifiez les autorisations IP

2. **Erreur de déploiement**
   - Vérifiez que Firebase CLI est installé
   - Vérifiez que vous êtes connecté : `firebase login`

3. **Erreur de build**
   - Vérifiez que Node.js est installé
   - Vérifiez les dépendances : `npm install`

### Support

- [Documentation Firebase](https://firebase.google.com/docs)
- [Documentation MongoDB Atlas](https://docs.atlas.mongodb.com/)

## 🎉 Félicitations !

Votre application de tombola est maintenant hébergée gratuitement sur Firebase ! 🚀
