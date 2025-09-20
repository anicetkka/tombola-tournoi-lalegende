import React, { useState } from 'react';
import toast from 'react-hot-toast';

const DirectLogin = () => {
  const [formData, setFormData] = useState({
    phone: '+2250000000000',
    password: 'Admin123!'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('🚀 CONNEXION DIRECTE AVEC FETCH');
    console.log('📞 Téléphone:', formData.phone);
    console.log('🔑 Mot de passe:', formData.password);
    
    try {
      // Connexion directe avec fetch
      const response = await fetch('https://tombola-backend-api.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone,
          password: formData.password
        })
      });
      
      console.log('📡 Réponse reçue, status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Données reçues:', data);
        
        // Sauvegarder dans localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        toast.success('✅ Connexion réussie !');
        
        // Redirection directe
        if (data.user.role === 'admin') {
          console.log('🔀 Redirection vers /admin');
          window.location.href = '/admin';
        } else {
          console.log('🔀 Redirection vers /user/profile');
          window.location.href = '/user/profile';
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Erreur de connexion:', errorData);
        toast.error('❌ ' + (errorData.message || 'Erreur de connexion'));
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      toast.error('❌ Erreur de connexion: ' + error.message);
    }
    
    setIsLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Connexion Directe</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de téléphone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+225XXXXXXXXXX"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mot de passe"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
          
          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => setFormData({ phone: '+2250000000000', password: 'Admin123!' })}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 text-sm"
            >
              Utiliser Admin 1 (+2250000000000)
            </button>
            <button
              type="button"
              onClick={() => setFormData({ phone: '+2250703909441', password: 'Admin123!' })}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 text-sm"
            >
              Utiliser Admin 2 (+2250703909441)
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Retour à la page de connexion normale
          </a>
        </div>
      </div>
    </div>
  );
};

export default DirectLogin;
