import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Phone, Calendar, Gift, TrendingUp, Settings, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateProfileForm = () => {
    const newErrors = {};

    if (!profileData.fullName.trim()) {
      newErrors.fullName = 'Le nom complet est requis';
    } else if (profileData.fullName.trim().length < 2) {
      newErrors.fullName = 'Le nom doit contenir au moins 2 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Le mot de passe actuel est requis';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }

    setIsLoading(true);
    const result = await updateProfile(profileData);
    setIsLoading(false);

    if (result.success) {
      setIsEditing(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    setIsLoading(true);
    const result = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    setIsLoading(false);

    if (result.success) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Vue d\'ensemble', icon: User },
    { id: 'participations', name: 'Mes Participations', icon: Gift },
    { id: 'settings', name: 'Paramètres', icon: Settings }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
        <p className="text-gray-600 mt-2">Gérez vos informations et suivez vos participations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{user?.fullName}</h3>
              <p className="text-sm text-gray-500">{user?.phone}</p>
            </div>
            
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="lg:col-span-3">
          {/* Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Gift className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Participations</p>
                      <p className="text-2xl font-bold text-gray-900">{user?.totalParticipations || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="card p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-success-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Participations Validées</p>
                      <p className="text-2xl font-bold text-gray-900">-</p>
                    </div>
                  </div>
                </div>
                
                <div className="card p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-warning-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Membre depuis</p>
                      <p className="text-sm font-bold text-gray-900">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations personnelles */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="btn btn-outline btn-sm"
                  >
                    {isEditing ? 'Annuler' : 'Modifier'}
                  </button>
                </div>
                
                {isEditing ? (
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={profileData.fullName}
                        onChange={handleProfileChange}
                        className={`input ${errors.fullName ? 'input-error' : ''}`}
                        disabled={isLoading}
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-sm text-danger-600">{errors.fullName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Numéro de téléphone
                      </label>
                      <input
                        type="text"
                        value={user?.phone || ''}
                        className="input bg-gray-50"
                        disabled
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Le numéro de téléphone ne peut pas être modifié
                      </p>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary"
                      >
                        {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="btn btn-outline"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Nom complet</p>
                        <p className="text-gray-900">{user?.fullName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Numéro de téléphone</p>
                        <p className="text-gray-900">{user?.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Membre depuis</p>
                        <p className="text-gray-900">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Paramètres */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Sécurité</h3>
                
                {!showPasswordForm ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Mot de passe</h4>
                        <p className="text-sm text-gray-600">Modifiez votre mot de passe</p>
                      </div>
                      <button
                        onClick={() => setShowPasswordForm(true)}
                        className="btn btn-outline btn-sm"
                      >
                        Modifier
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mot de passe actuel
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className={`input pr-10 ${errors.currentPassword ? 'input-error' : ''}`}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="w-5 h-5 text-gray-400" />
                          ) : (
                            <Eye className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="mt-1 text-sm text-danger-600">{errors.currentPassword}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className={`input pr-10 ${errors.newPassword ? 'input-error' : ''}`}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-5 h-5 text-gray-400" />
                          ) : (
                            <Eye className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <p className="mt-1 text-sm text-danger-600">{errors.newPassword}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmer le nouveau mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className={`input pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5 text-gray-400" />
                          ) : (
                            <Eye className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-danger-600">{errors.confirmPassword}</p>
                      )}
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary"
                      >
                        {isLoading ? 'Modification...' : 'Modifier le mot de passe'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          });
                          setErrors({});
                        }}
                        className="btn btn-outline"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Mes participations */}
          {activeTab === 'participations' && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Mes Participations</h3>
              <p className="text-gray-600">
                Vos participations seront affichées ici. 
                <a href="/user/participations" className="text-primary-600 hover:text-primary-700 ml-1">
                  Voir toutes mes participations
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
