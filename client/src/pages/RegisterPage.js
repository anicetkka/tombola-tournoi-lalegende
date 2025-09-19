import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Phone, User, Lock } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: '',
    fullName: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

    // Validation du numéro de téléphone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est requis';
    } else {
      const formattedPhone = formatPhoneNumber(formData.phone);
      if (!/^\+225[0-9]{10}$/.test(formattedPhone)) {
        newErrors.phone = 'Format de numéro ivoirien invalide (+225XXXXXXXXXX)';
      }
    }

    // Validation du nom complet
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Le nom complet est requis';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Le nom doit contenir au moins 2 caractères';
    } else if (formData.fullName.trim().length > 100) {
      newErrors.fullName = 'Le nom ne peut pas dépasser 100 caractères';
    }

    // Validation du mot de passe
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    // Validation de la confirmation du mot de passe
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    const formattedPhone = formatPhoneNumber(formData.phone);
    
    const result = await register({
      phone: formattedPhone,
      fullName: formData.fullName.trim(),
      password: formData.password
    });

    setIsLoading(false);

    if (result.success) {
      navigate('/user/profile');
    }
  };

  return (
    <div className="card max-w-md mx-auto">
      <div className="card-header text-center">
        <h2 className="text-2xl font-bold text-gray-900">Inscription</h2>
        <p className="text-gray-600">Créez votre compte pour participer</p>
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

        {/* Nom complet */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
            Nom complet
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Votre nom complet"
              className={`input pl-10 ${errors.fullName ? 'input-error' : ''}`}
              disabled={isLoading}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
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
          <p className="mt-1 text-xs text-gray-500">
            Au moins 6 caractères avec majuscule, minuscule et chiffre
          </p>
        </div>

        {/* Confirmation du mot de passe */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirmez votre mot de passe"
              className={`input pl-10 pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
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
              Inscription...
            </div>
          ) : (
            'S\'inscrire'
          )}
        </button>

        {/* Liens */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Déjà un compte ?{' '}
            <Link
              to="/auth/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Se connecter
            </Link>
          </p>
        </div>

        {/* Conditions d'utilisation */}
        <div className="text-xs text-gray-500 text-center">
          En vous inscrivant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
