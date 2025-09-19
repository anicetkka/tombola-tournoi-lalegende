import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  Gift, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminDashboard = () => {
  const { api } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement du tableau de bord:', err);
      setError('Erreur lors du chargement des données');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'validated': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'validated': return 'Validée';
      case 'rejected': return 'Rejetée';
      case 'completed': return 'Terminée';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-danger-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
        <p className="text-gray-600 mb-6">{error || 'Impossible de charger les données'}</p>
        <button
          onClick={fetchDashboardData}
          className="btn btn-primary"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble de la plateforme</p>
      </div>

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Gift className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tombolas</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalTombolas}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Participations</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalParticipations}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenus</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(dashboardData.stats.totalRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques des participations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statut des participations</h3>
          <div className="space-y-3">
            {dashboardData.stats.participationStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${getStatusColor(stat._id).split(' ')[1]}`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {getStatusText(stat._id)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{stat.count}</p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(stat.totalAmount || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tombolas récentes</h3>
          <div className="space-y-3">
            {dashboardData.recentTombolas.slice(0, 5).map((tombola) => (
              <div key={tombola.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{tombola.title}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(tombola.createdAt), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{tombola.totalParticipations}</p>
                  <p className="text-xs text-gray-500">participations</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Participations en attente */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Participations en attente de validation</h3>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            {dashboardData.pendingParticipations.length} en attente
          </div>
        </div>
        
        {dashboardData.pendingParticipations.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600">Aucune participation en attente</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tombola
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.pendingParticipations.map((participation) => (
                  <tr key={participation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {participation.userId?.fullName || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {participation.userId?.phone || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">
                        {participation.tombolaId?.title || 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{participation.transactionId}</p>
                      <p className="text-sm text-gray-500">{participation.paymentMethod}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(participation.amount)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">
                        {format(new Date(participation.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-green-600 hover:text-green-900">
                          Valider
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Rejeter
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tombolas prêtes pour le tirage */}
      {dashboardData.readyForDraw.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Tombolas prêtes pour le tirage</h3>
            <div className="flex items-center text-sm text-orange-600">
              <AlertCircle className="w-4 h-4 mr-2" />
              {dashboardData.readyForDraw.length} en attente
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.readyForDraw.map((tombola) => (
              <div key={tombola.id} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{tombola.title}</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Participations: {tombola.totalParticipations}</p>
                  <p>Date de fin: {format(new Date(tombola.endDate), 'dd/MM/yyyy', { locale: fr })}</p>
                </div>
                <button className="mt-3 btn btn-warning btn-sm w-full">
                  Effectuer le tirage
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="btn btn-primary">
            <Gift className="w-4 h-4 mr-2" />
            Nouvelle tombola
          </button>
          <button className="btn btn-outline">
            <FileText className="w-4 h-4 mr-2" />
            Voir participations
          </button>
          <button className="btn btn-outline">
            <Users className="w-4 h-4 mr-2" />
            Gérer utilisateurs
          </button>
          <button className="btn btn-outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Statistiques
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
