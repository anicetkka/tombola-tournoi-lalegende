# 🎰 Tombola Tournoi La Légende

Application web de tombola en ligne pour la Côte d'Ivoire avec paiement mobile (Wave/Orange Money).

## 🚀 Fonctionnalités

- ✅ **Inscription/Connexion** des utilisateurs
- ✅ **Gestion des tombolas** par l'administrateur
- ✅ **Participation** avec paiement mobile
- ✅ **Validation manuelle** des paiements par l'admin
- ✅ **Tirage au sort** sécurisé
- ✅ **Système de contact** avec l'admin
- ✅ **Interface responsive** (mobile/desktop)

## 🛠️ Technologies

### Backend
- **Node.js** + Express.js
- **MongoDB** (Atlas)
- **JWT** pour l'authentification
- **bcrypt** pour le hashage des mots de passe

### Frontend
- **React** + React Router
- **Tailwind CSS** pour le design
- **Axios** pour les appels API
- **React Hot Toast** pour les notifications

## 🌐 Déploiement

### Frontend
- **Firebase Hosting** : https://tombolalalegende.web.app

### Backend API
- **Railway/Render** : URL à définir

### Base de données
- **MongoDB Atlas** (gratuit)

## 📱 Configuration

### Variables d'environnement (Backend)
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
ADMIN_PHONE=+2250703909441
ADMIN_PASSWORD=Admin123!
```

## 🚀 Installation locale

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm start
```

## 📞 Contact

Pour toute question ou support, contactez l'administrateur via l'interface web.

---

© 2024 Tombola Tournoi La Légende - Côte d'Ivoire