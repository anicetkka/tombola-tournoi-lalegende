import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Gift, Calendar, Users, DollarSign, Clock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

const TombolaDetailPage = () => {
  const { id } = useParams();
  const { api, isAuthenticated } = useAuth();
  const [tombola, setTombola] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTombola();
  }, [id]);

  const fetchTombola = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tombolas/${id}`);
      setTombola(response.data.tombola);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement de la tombola:', err);
      setError('Erreur lors du chargement de la tombola');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusInfo = (tombola) => {
    const now = new Date();
    const endDate = new Date(tombola.endDate);
    
    if (tombola.isDrawn) {
      return {
        status: 'drawn',
        text: 'Tombola tirée',
        color: 'text-primary-600',
        bgColor: 'bg-primary-100',
        icon: CheckCircle
      };
    } else if (isAfter(endDate, now)) {
      return {
        status: 'active',
        text: 'Tombola active',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: CheckCircle
      };
    } else {
      return {
        status: 'ended',
        text: 'Tombola terminée',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        icon: AlertCircle
      };
    }
  };

  const canParticipate = (tombola) => {
    const now = new Date();
    const endDate = new Date(tombola.endDate);
    return isAfter(endDate, now) && !tombola.isDrawn && tombola.status === 'active';
  };

  const getTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    
    if (diffTime <= 0) return 'Terminée';
    
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    
    if (diffDays > 1) return `${diffDays} jours`;
    if (diffHours > 1) return `${diffHours} heures`;
    return `${diffMinutes} minutes`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      </div>
    );
  }

  if (error || !tombola) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-danger-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tombola non trouvée</h2>
          <p className="text-gray-600 mb-6">{error || 'Cette tombola n\'existe pas ou a été supprimée.'}</p>
          <Link to="/tombolas" className="btn btn-primary">
            Retour aux tombolas
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(tombola);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
        <Link to="/" className="hover:text-primary-600">Accueil</Link>
        <ArrowRight className="w-4 h-4" />
        <Link to="/tombolas" className="hover:text-primary-600">Tombolas</Link>
        <ArrowRight className="w-4 h-4" />
        <span className="text-gray-900">{tombola.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contenu principal */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="card p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <Gift className="w-8 h-8 text-primary-600" />
                  <h1 className="text-3xl font-bold text-gray-900">{tombola.title}</h1>
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                  <StatusIcon className="w-4 h-4 mr-2" />
                  {statusInfo.text}
                </div>
              </div>
            </div>

            <p className="text-lg text-gray-700 leading-relaxed">
              {tombola.description}
            </p>
          </div>

          {/* Informations détaillées */}
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Détails de la tombola</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <DollarSign className="w-6 h-6 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Cagnotte</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(tombola.prizeAmount)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Users className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Prix de participation</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(tombola.participationPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="w-6 h-6 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Date de fin</p>
                      <p className="text-lg font-bold text-purple-600">
                        {format(new Date(tombola.endDate), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-6 h-6 text-orange-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Temps restant</p>
                      <p className="text-lg font-bold text-orange-600">
                        {getTimeRemaining(tombola.endDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            {tombola.totalParticipations > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{tombola.totalParticipations}</p>
                    <p className="text-sm text-gray-600">Participations</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(tombola.totalRevenue)}
                    </p>
                    <p className="text-sm text-gray-600">Revenus totaux</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {tombola.maxParticipants || '∞'}
                    </p>
                    <p className="text-sm text-gray-600">Max participants</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            {/* Actions */}
            <div className="card p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              
              {canParticipate(tombola) ? (
                <div className="space-y-3">
                  {isAuthenticated ? (
                    <Link
                      to={`/user/tombolas/${tombola.id}/participate`}
                      className="btn btn-primary btn-lg w-full"
                    >
                      Participer maintenant
                    </Link>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        to="/auth/register"
                        className="btn btn-primary btn-lg w-full"
                      >
                        S'inscrire pour participer
                      </Link>
                      <Link
                        to="/auth/login"
                        className="btn btn-outline btn-lg w-full"
                      >
                        Se connecter
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    {tombola.isDrawn 
                      ? 'Cette tombola a déjà été tirée'
                      : 'Cette tombola est terminée'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Informations de paiement */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Méthodes de paiement</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-orange-600 font-bold text-sm">O</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Orange Money</h4>
                  </div>
                  <p className="text-sm text-gray-600">+2250703909441</p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-bold text-sm">W</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Wave</h4>
                  </div>
                  <p className="text-sm text-gray-600">+2250703909441</p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>Important :</strong> Utilisez le montant exact de {formatCurrency(tombola.participationPrice)} 
                  et conservez l'ID de transaction pour votre participation.
                </p>
              </div>
            </div>

            {/* Liens utiles */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Liens utiles</h3>
              <div className="space-y-2">
                <Link to="/tombolas" className="block text-primary-600 hover:text-primary-700 text-sm">
                  ← Retour aux tombolas
                </Link>
                {isAuthenticated && (
                  <Link to="/user/participations" className="block text-primary-600 hover:text-primary-700 text-sm">
                    Mes participations
                  </Link>
                )}
                <Link to="/" className="block text-primary-600 hover:text-primary-700 text-sm">
                  Accueil
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TombolaDetailPage;
