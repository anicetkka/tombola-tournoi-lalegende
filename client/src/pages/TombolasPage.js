import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Gift, Calendar, Users, DollarSign, Clock, ArrowRight } from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';

const TombolasPage = () => {
  const { api, isAuthenticated } = useAuth();
  const [tombolas, setTombolas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, ended, drawn

  useEffect(() => {
    fetchTombolas();
  }, [filter]);

  const fetchTombolas = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await api.get('/tombolas', { params });
      setTombolas(response.data.tombolas);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des tombolas:', err);
      setError('Erreur lors du chargement des tombolas');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (tombola) => {
    const now = new Date();
    const endDate = new Date(tombola.endDate);
    
    if (tombola.isDrawn) {
      return <span className="badge badge-primary">Tirée</span>;
    } else if (isAfter(endDate, now)) {
      return <span className="badge badge-success">Active</span>;
    } else {
      return <span className="badge badge-warning">Terminée</span>;
    }
  };

  const getStatusColor = (tombola) => {
    const now = new Date();
    const endDate = new Date(tombola.endDate);
    
    if (tombola.isDrawn) {
      return 'border-primary-200 bg-primary-50';
    } else if (isAfter(endDate, now)) {
      return 'border-green-200 bg-green-50';
    } else {
      return 'border-yellow-200 bg-yellow-50';
    }
  };

  const canParticipate = (tombola) => {
    const now = new Date();
    const endDate = new Date(tombola.endDate);
    return isAfter(endDate, now) && !tombola.isDrawn && tombola.status === 'active';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filters = [
    { id: 'all', name: 'Toutes' },
    { id: 'active', name: 'Actives' },
    { id: 'ended', name: 'Terminées' },
    { id: 'drawn', name: 'Tirées' }
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
          <p className="text-danger-600">{error}</p>
          <button
            onClick={fetchTombolas}
            className="btn btn-primary mt-4"
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
        <h1 className="text-3xl font-bold text-gray-900">Tombolas</h1>
        <p className="text-gray-600 mt-2">Découvrez toutes les tombolas disponibles</p>
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
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption.name}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des tombolas */}
      {tombolas.length === 0 ? (
        <div className="text-center py-12">
          <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tombola trouvée</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Il n\'y a actuellement aucune tombola disponible.'
              : `Aucune tombola ${filters.find(f => f.id === filter)?.name.toLowerCase()} trouvée.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tombolas.map((tombola) => (
            <div
              key={tombola.id}
              className={`card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${getStatusColor(tombola)}`}
            >
              {/* Header de la carte */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {tombola.title}
                  </h3>
                  {getStatusBadge(tombola)}
                </div>
                <Gift className="w-8 h-8 text-primary-600" />
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {tombola.description}
              </p>

              {/* Informations de la tombola */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Cagnotte
                  </div>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(tombola.prizeAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    Participation
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(tombola.participationPrice)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Date de fin
                  </div>
                  <span className="font-semibold text-gray-900">
                    {format(new Date(tombola.endDate), 'dd/MM/yyyy', { locale: fr })}
                  </span>
                </div>

                {tombola.totalParticipations > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      Participants
                    </div>
                    <span className="font-semibold text-gray-900">
                      {tombola.totalParticipations}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <Link
                  to={`/tombolas/${tombola.id}`}
                  className="btn btn-outline btn-sm flex-1"
                >
                  Voir détails
                </Link>
                
                {canParticipate(tombola) && isAuthenticated && (
                  <Link
                    to={`/user/tombolas/${tombola.id}/participate`}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    Participer
                  </Link>
                )}
                
                {canParticipate(tombola) && !isAuthenticated && (
                  <Link
                    to="/auth/register"
                    className="btn btn-primary btn-sm flex-1"
                  >
                    S'inscrire
                  </Link>
                )}
              </div>

              {/* Indicateur de temps restant */}
              {canParticipate(tombola) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>
                      {isBefore(new Date(tombola.endDate), new Date()) 
                        ? 'Terminée'
                        : `Fin dans ${Math.ceil((new Date(tombola.endDate) - new Date()) / (1000 * 60 * 60 * 24))} jours`
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Call to action pour les utilisateurs non connectés */}
      {!isAuthenticated && tombolas.length > 0 && (
        <div className="mt-12 text-center">
          <div className="card p-8 bg-primary-50 border-primary-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Prêt à participer ?
            </h3>
            <p className="text-gray-600 mb-6">
              Créez votre compte pour participer à nos tombolas et tentez de gagner des cagnottes attractives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth/register"
                className="btn btn-primary btn-lg"
              >
                S'inscrire maintenant
              </Link>
              <Link
                to="/auth/login"
                className="btn btn-outline btn-lg"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TombolasPage;
