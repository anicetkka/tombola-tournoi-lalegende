import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart3, TrendingUp, Users, Gift, DollarSign, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminStats = () => {
  const { api } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      
      const response = await api.get('/admin/stats/detailed', { params });
      setStats(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError('Erreur lors du chargement des statistiques');
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

  const getMonthName = (month) => {
    const months = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
      'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
    ];
    return months[month - 1] || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center">
        <BarChart3 className="w-16 h-16 text-danger-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
        <p className="text-gray-600 mb-6">{error || 'Impossible de charger les statistiques'}</p>
        <button
          onClick={fetchStats}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistiques détaillées</h1>
          <p className="text-gray-600 mt-2">Analyse complète de la plateforme</p>
        </div>
        
        {/* Filtres de date */}
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de début
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de fin
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Statistiques des utilisateurs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.userStats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Utilisateurs actifs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.userStats.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Administrateurs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.userStats.adminUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques des tombolas */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques des tombolas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.tombolaStats.map((stat, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat._id === 'active' ? 'Actives' :
                     stat._id === 'ended' ? 'Terminées' :
                     stat._id === 'drawn' ? 'Tirées' :
                     stat._id === 'cancelled' ? 'Annulées' : stat._id}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                </div>
                <Gift className="w-8 h-8 text-primary-600" />
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p>Cagnotte: {formatCurrency(stat.totalPrizeAmount || 0)}</p>
                <p>Revenus: {formatCurrency(stat.totalRevenue || 0)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiques mensuelles */}
      {stats.monthlyStats.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution mensuelle</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.monthlyStats.map((stat, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">
                        {getMonthName(stat._id.month)} {stat._id.year}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{stat.count}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(stat.totalAmount)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top utilisateurs */}
      {stats.topUsers.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top utilisateurs par participations</h3>
          <div className="space-y-4">
            {stats.topUsers.map((user, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary-600 font-bold text-sm">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.user.fullName}</p>
                    <p className="text-sm text-gray-600">{user.user.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.participationCount} participations
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(user.totalAmount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Graphique simple (placeholder) */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des participations</h3>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Graphique des statistiques</p>
            <p className="text-sm text-gray-500">À implémenter avec une bibliothèque de graphiques</p>
          </div>
        </div>
      </div>

      {/* Actions d'export */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export des données</h3>
        <div className="flex flex-wrap gap-4">
          <button className="btn btn-outline">
            <Calendar className="w-4 h-4 mr-2" />
            Export participations
          </button>
          <button className="btn btn-outline">
            <Users className="w-4 h-4 mr-2" />
            Export utilisateurs
          </button>
          <button className="btn btn-outline">
            <Gift className="w-4 h-4 mr-2" />
            Export tombolas
          </button>
          <button className="btn btn-outline">
            <DollarSign className="w-4 h-4 mr-2" />
            Export financier
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
