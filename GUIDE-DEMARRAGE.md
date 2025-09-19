# Guide de Démarrage Rapide - Tombola Côte d'Ivoire

## 🚨 Problème de Connexion MongoDB

Si vous rencontrez l'erreur `MongooseServerSelectionError: connect ECONNREFUSED`, cela signifie que MongoDB n'est pas en cours d'exécution.

## 🔧 Solution Rapide

### Étape 1 : Installer et Démarrer MongoDB

**Option A : Script Automatique (Recommandé)**
```bash
# Double-cliquez sur le fichier
install-mongodb.bat
```

**Option B : Installation Manuelle**
1. Téléchargez MongoDB Community Server : https://www.mongodb.com/try/download/community
2. Installez avec les options par défaut
3. Créez le dossier `C:\data\db`
4. Démarrez MongoDB : `mongod --dbpath "C:\data\db"`

### Étape 2 : Démarrer l'Application

```bash
# Double-cliquez sur le fichier
start-app.bat
```

### Étape 3 : Créer un Administrateur

```bash
# Double-cliquez sur le fichier
setup-admin.bat
```

### Étape 4 : Créer des Données de Test (Optionnel)

```bash
# Double-cliquez sur le fichier
create-test-data.bat
```

## 📋 Scripts Disponibles

| Script | Description |
|--------|-------------|
| `install.bat` | Installation des dépendances Node.js |
| `install-mongodb.bat` | Installation et démarrage de MongoDB |
| `start-app.bat` | Démarrage complet de l'application |
| `setup-admin.bat` | Création de l'utilisateur administrateur |
| `create-test-data.bat` | Création de données de test |

## 🔑 Identifiants par Défaut

Après avoir créé l'administrateur :
- **Téléphone** : `+2250000000000`
- **Mot de passe** : `Admin123!`

## 🌐 Accès à l'Application

Une fois démarrée, l'application sera accessible sur :
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5000

## 🛠️ Dépannage

### MongoDB ne démarre pas
1. Vérifiez que le port 27017 n'est pas utilisé
2. Créez manuellement le dossier `C:\data\db`
3. Lancez : `mongod --dbpath "C:\data\db"`

### Erreur de permissions
1. Lancez l'invite de commande en tant qu'administrateur
2. Relancez les scripts

### Port déjà utilisé
1. Arrêtez les autres applications utilisant les ports 3000 ou 5000
2. Ou modifiez les ports dans les fichiers de configuration

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez que tous les prérequis sont installés
2. Consultez les logs d'erreur
3. Relancez les scripts dans l'ordre

## ✅ Vérification du Bon Fonctionnement

L'application fonctionne correctement si :
- ✅ MongoDB est en cours d'exécution
- ✅ Le serveur backend répond sur http://localhost:5000
- ✅ Le frontend s'affiche sur http://localhost:3000
- ✅ Vous pouvez vous connecter avec les identifiants admin

---

**Note** : Ce guide est spécifique à Windows. Pour Linux/macOS, utilisez les scripts `.sh` correspondants.
