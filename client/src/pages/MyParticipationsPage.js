import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Gift, Calendar, DollarSign, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const MyParticipationsPage = () => {
  const { api } = useAuth();
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchParticipations();
  }, [filter]);

  const fetchParticipations = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await api.get('/users/participations', { params });
      setParticipations(response.data.participations);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des participations:', err);
      setError('Erreur lors du chargement des participations');
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

  const getStatusInfo = (status, isWinner) => {
    switch (status) {
      case 'pending':
        return {
          text: 'En attente',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          icon: Clock
        };
      case 'validated':
        return {
          text: 'Participation validée',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: CheckCircle
        };
      case 'rejected':
        return {
          text: 'Participation rejetée',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: XCircle
        };
      case 'completed':
        return {
          text: isWinner ? 'Gagnant !' : 'Tombola validée',
          color: isWinner ? 'text-green-600' : 'text-blue-600',
          bgColor: isWinner ? 'bg-green-100' : 'bg-blue-100',
          icon: isWinner ? CheckCircle : AlertCircle
        };
      default:
        return {
          text: status,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: AlertCircle
        };
    }
  };

  const filters = [
    { id: 'all', name: 'Toutes' },
    { id: 'pending', name: 'En attente' },
    { id: 'validated', name: 'Validées' },
    { id: 'rejected', name: 'Rejetées' },
    { id: 'completed', name: 'Terminées' }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchParticipations}
            className="btn btn-primary"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mes Participations</h1>
        <p className="text-gray-600 mt-2">Suivez l'état de vos participations aux tombolas</p>
      </div>

      {/* Filtres */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {filters.map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterOption.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption.name}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des participations */}
      {participations.length === 0 ? (
        <div className="text-center py-12">
          <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune participation</h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? 'Vous n\'avez pas encore participé à une tombola.'
              : `Aucune participation ${filters.find(f => f.id === filter)?.name.toLowerCase()} trouvée.`
            }
          </p>
          <a href="/tombolas" className="btn btn-primary">
            Voir les tombolas
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {participations.map((participation) => {
            const statusInfo = getStatusInfo(participation.status, participation.isWinner);
            const StatusIcon = statusInfo.icon;

            return (
              <div key={participation.id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {participation.tombola?.title || 'Tombola supprimée'}
                    </h3>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                      <StatusIcon className="w-4 h-4 mr-2" />
                      {statusInfo.text}
                    </div>
                  </div>
                  <Gift className="w-8 h-8 text-blue-600" />
                </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span>Montant: {formatCurrency(participation.amount)}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Date: {format(new Date(participation.createdAt), 'dd/MM/yyyy', { locale: fr })}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="w-4 h-4 mr-2 text-center">🎫</span>
                        <span>N°: {participation.participationNumber || 'N/A'}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="w-4 h-4 mr-2 text-center">📱</span>
                        <span>Paiement: {participation.paymentMethod}</span>
                      </div>
                    </div>

                {/* Informations supplémentaires */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">
                        <strong>Numéro de paiement:</strong> {participation.paymentPhone}
                      </p>
                      {participation.tombola && (
                        <p className="text-gray-600">
                          <strong>Cagnotte:</strong> {formatCurrency(participation.tombola.prizeAmount)}
                        </p>
                      )}
                    </div>
                    <div>
                      {participation.validatedAt && (
                        <p className="text-gray-600">
                          <strong>Validé le:</strong> {format(new Date(participation.validatedAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </p>
                      )}
                      {participation.isWinner && (
                        <p className="text-green-600 font-semibold">
                          🎉 Félicitations ! Vous avez gagné cette tombola !
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message de statut */}
                {participation.status === 'pending' && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>En attente de validation</strong><br />
                      Votre participation est en cours de validation par l'administrateur. 
                      Vous recevrez une confirmation dans les 24-48h.
                    </p>
                  </div>
                )}

                {participation.status === 'rejected' && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Participation rejetée</strong><br />
                      Votre participation a été rejetée. Contactez l'administrateur pour plus d'informations.
                    </p>
                  </div>
                )}

                {participation.isWinner && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                      <div>
                        <p className="text-lg font-semibold text-green-800">
                          🎉 Félicitations ! Vous avez gagné !
                        </p>
                        <p className="text-sm text-green-700">
                          Vous avez gagné la cagnotte de {formatCurrency(participation.tombola?.prizeAmount || 0)}. 
                          L'administrateur vous contactera pour le versement.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Statistiques personnelles */}
      {participations.length > 0 && (
        <div className="mt-12">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques personnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {participations.length}
                </p>
                <p className="text-sm text-gray-600">Total participations</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {participations.filter(p => p.status === 'validated' || p.status === 'completed').length}
                </p>
                <p className="text-sm text-gray-600">Participations validées</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {participations.filter(p => p.isWinner).length}
                </p>
                <p className="text-sm text-gray-600">Victoires</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyParticipationsPage;
