#!/bin/bash

echo "========================================"
echo "Installation de Tombola Cote d'Ivoire"
echo "========================================"
echo

echo "Installation des dépendances racine..."
npm install
if [ $? -ne 0 ]; then
    echo "Erreur lors de l'installation des dépendances racine"
    exit 1
fi

echo
echo "Installation des dépendances serveur..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "Erreur lors de l'installation des dépendances serveur"
    exit 1
fi

echo
echo "Installation des dépendances client..."
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo "Erreur lors de l'installation des dépendances client"
    exit 1
fi

cd ..

echo
echo "========================================"
echo "Installation terminée avec succès !"
echo "========================================"
echo
echo "Prochaines étapes :"
echo "1. Configurez le fichier server/.env"
echo "2. Démarrez MongoDB"
echo "3. Lancez l'application avec : npm run dev"
echo
