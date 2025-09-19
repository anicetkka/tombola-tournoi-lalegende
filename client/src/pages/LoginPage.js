import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Phone, Lock, X, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactData, setContactData] = useState({
    phone: '',
    message: ''
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const formatPhoneNumber = (phone) => {
    // Supprimer tous les caractères non numériques
    let cleaned = phone.replace(/\D/g, '');
    
    // Si le numéro commence par 0, remplacer par +225
    if (cleaned.startsWith('0')) {
      cleaned = '+225' + cleaned.substring(1);
    } else if (!cleaned.startsWith('225')) {
      cleaned = '+225' + cleaned;
    } else {
      cleaned = '+' + cleaned;
    }
    
    // Limiter à 10 chiffres après +225
    if (cleaned.startsWith('+225') && cleaned.length > 13) {
      cleaned = '+225' + cleaned.substring(4, 14);
    }
    
    return cleaned;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est requis';
    } else {
      const formattedPhone = formatPhoneNumber(formData.phone);
      if (!/^\+225[0-9]{10}$/.test(formattedPhone)) {
        newErrors.phone = 'Format de numéro ivoirien invalide (+225XXXXXXXXXX)';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📝 DÉBUT handleSubmit');
    
    if (!validateForm()) {
      console.log('❌ Validation échouée');
      return;
    }

    console.log('✅ Validation réussie, démarrage du loading');
    setIsLoading(true);
    
    const formattedPhone = formatPhoneNumber(formData.phone);
    console.log('📞 Téléphone formaté:', formattedPhone);
    
    console.log('🔐 Appel de la fonction login...');
    const result = await login({
      phone: formattedPhone,
      password: formData.password
    });

    console.log('📋 Résultat de login:', result);
    setIsLoading(false);

    if (result.success) {
      console.log('✅ Connexion réussie, redirection...');
      // Redirection basée sur le rôle de l'utilisateur
      const userRole = result.user?.role;
      console.log('👤 Rôle utilisateur:', userRole);
      if (userRole === 'admin') {
        console.log('🔀 Redirection vers /admin');
        navigate('/admin', { replace: true });
      } else {
        console.log('🔀 Redirection vers /user/profile');
        navigate('/user/profile', { replace: true });
      }
    } else {
      console.log('❌ Connexion échouée:', result.error);
    }
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    if (!contactData.phone.trim()) {
      toast.error('Veuillez saisir votre numéro de téléphone');
      return;
    }
    
    if (!contactData.message.trim()) {
      toast.error('Veuillez saisir votre message');
      return;
    }

    setIsSubmittingContact(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formatPhoneNumber(contactData.phone),
          message: contactData.message.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setShowContactModal(false);
        setContactData({ phone: '', message: '' });
      } else {
        toast.error(data.message || 'Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      toast.error('Erreur de connexion. Veuillez réessayer.');
    }
    
    setIsSubmittingContact(false);
  };

  const openContactModal = () => {
    setContactData(prev => ({
      ...prev,
      phone: formData.phone // Pré-remplir avec le numéro saisi
    }));
    setShowContactModal(true);
  };

  return (
    <div className="card max-w-md mx-auto">
      <div className="card-header text-center">
        <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
        <p className="text-gray-600">Connectez-vous à votre compte</p>
      </div>
      
      <form onSubmit={handleSubmit} className="card-content space-y-6">
        {/* Numéro de téléphone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Numéro de téléphone
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+225XXXXXXXXXX"
              className={`input pl-10 ${errors.phone ? 'input-error' : ''}`}
              disabled={isLoading}
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Mot de passe */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Votre mot de passe"
              className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary btn-lg w-full"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="loading-spinner w-5 h-5 mr-2"></div>
              Connexion...
            </div>
          ) : (
            'Se connecter'
          )}
        </button>

        {/* Liens */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Pas encore de compte ?{' '}
            <Link
              to="/auth/register"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              S'inscrire
            </Link>
          </p>
          <p className="text-sm text-gray-600">
            Mot de passe oublié ?{' '}
            <button
              type="button"
              onClick={openContactModal}
              className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer underline"
            >
              Contacter l'administrateur
            </button>
          </p>
        </div>
      </form>

      {/* Modal de contact admin */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                Contacter l'administrateur
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleContactSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Votre numéro de téléphone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="contact-phone"
                    name="phone"
                    value={contactData.phone}
                    onChange={handleContactChange}
                    placeholder="+225XXXXXXXXXX"
                    className="input pl-10 w-full"
                    disabled={isSubmittingContact}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-2">
                  Votre message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={contactData.message}
                  onChange={handleContactChange}
                  placeholder="Décrivez votre problème (mot de passe oublié, compte bloqué, etc.)"
                  rows={4}
                  className="input w-full resize-none"
                  disabled={isSubmittingContact}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Informations importantes :</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• L'administrateur vous répondra sous 24h</li>
                  <li>• Précisez votre numéro de téléphone exact</li>
                  <li>• Décrivez clairement votre problème</li>
                  <li>• Vous pouvez aussi contacter directement : +225 07 03 90 94 41</li>
                </ul>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="btn btn-secondary flex-1"
                  disabled={isSubmittingContact}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingContact}
                  className="btn btn-primary flex-1"
                >
                  {isSubmittingContact ? (
                    <div className="flex items-center justify-center">
                      <div className="loading-spinner w-4 h-4 mr-2"></div>
                      Envoi...
                    </div>
                  ) : (
                    'Envoyer le message'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
