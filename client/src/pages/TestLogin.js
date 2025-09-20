import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const TestLogin = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleTestLogin = async () => {
    setIsLoading(true);
    console.log('🧪 TEST DE CONNEXION DIRECTE');
    
    try {
      const result = await login({
        phone: '+2250703909441',
        password: 'Admin123!'
      });
      
      console.log('📋 Résultat du test:', result);
      
      if (result.success) {
        toast.success('✅ Test de connexion réussi !');
        console.log('✅ Connexion réussie, utilisateur:', result.user);
        
        // Redirection simple
        if (result.user?.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/user/profile';
        }
      } else {
        toast.error('❌ Test de connexion échoué: ' + result.error);
        console.error('❌ Erreur:', result.error);
      }
    } catch (error) {
      toast.error('❌ Erreur de test: ' + error.message);
      console.error('❌ Erreur de test:', error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Test de Connexion</h1>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Identifiants de test :</h3>
            <p className="text-blue-700">Téléphone: +2250703909441</p>
            <p className="text-blue-700">Mot de passe: Admin123!</p>
          </div>
          
          <button
            onClick={handleTestLogin}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Test en cours...' : 'Tester la Connexion'}
          </button>
          
          <div className="text-center">
            <a href="/auth/login" className="text-blue-600 hover:underline">
              Retour à la page de connexion normale
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestLogin;