import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, CheckCircle, XCircle, Clock, Eye, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminParticipations = () => {
  const { api } = useAuth();
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedParticipation, setSelectedParticipation] = useState(null);

  useEffect(() => {
    fetchParticipations();
  }, [filter]);

  const fetchParticipations = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await api.get('/participations', { params });
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

  const getStatusInfo = (status) => {
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
          text: 'Validée',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: CheckCircle
        };
      case 'rejected':
        return {
          text: 'Rejetée',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: XCircle
        };
      case 'completed':
        return {
          text: 'Terminée',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          icon: CheckCircle
        };
      default:
        return {
          text: status,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: FileText
        };
    }
  };

  const handleValidate = async (participationId, action) => {
    try {
      const response = await api.put(`/participations/${participationId}/validate`, {
        action: action,
        notes: ''
      });
      
      // Mettre à jour la participation dans la liste
      setParticipations(participations.map(p => 
        p.id === participationId 
          ? { 
              ...p, 
              status: action === 'validate' ? 'validated' : 'rejected',
              validatedAt: new Date()
            }
          : p
      ));
      
      setSelectedParticipation(null);
      
      // Afficher un message de succès
      const message = action === 'validate' ? 'Participation validée avec succès' : 'Participation rejetée';
      alert(message);
      
    } catch (err) {
      console.error('Erreur lors de la validation:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la validation';
      alert(`Erreur: ${errorMessage}`);
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
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchParticipations}
          className="btn btn-primary mt-4"
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
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Participations</h1>
          <p className="text-gray-600 mt-2">Validez et gérez les participations des utilisateurs</p>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input"
          >
            {filters.map((filterOption) => (
              <option key={filterOption.id} value={filterOption.id}>
                {filterOption.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900">
                {participations.filter(p => p.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Validées</p>
              <p className="text-2xl font-bold text-gray-900">
                {participations.filter(p => p.status === 'validated').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejetées</p>
              <p className="text-2xl font-bold text-gray-900">
                {participations.filter(p => p.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{participations.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des participations */}
      {participations.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune participation</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Il n\'y a actuellement aucune participation.'
              : `Aucune participation ${filters.find(f => f.id === filter)?.name.toLowerCase()} trouvée.`
            }
          </p>
        </div>
      ) : (
        <div className="card">
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
                    N° Participation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
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
                {participations.map((participation) => {
                  const statusInfo = getStatusInfo(participation.status);
                  const StatusIcon = statusInfo.icon;

                  return (
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
                        <p className="text-sm font-mono font-medium text-blue-600">
                          {participation.participationNumber || 'N/A'}
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900">
                          {format(new Date(participation.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedParticipation(participation)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {participation.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleValidate(participation.id, 'validate')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Valider
                              </button>
                              <button
                                onClick={() => handleValidate(participation.id, 'reject')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Rejeter
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {selectedParticipation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails de la participation</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Utilisateur</p>
                  <p className="text-gray-900">{selectedParticipation.userId?.fullName}</p>
                  <p className="text-sm text-gray-500">{selectedParticipation.userId?.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Tombola</p>
                  <p className="text-gray-900">{selectedParticipation.tombolaId?.title}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">N° de participation</p>
                  <p className="text-gray-900 font-mono font-medium text-blue-600">
                    {selectedParticipation.participationNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">ID de transaction</p>
                  <p className="text-gray-900">{selectedParticipation.transactionId}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Méthode de paiement</p>
                  <p className="text-gray-900">{selectedParticipation.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Numéro de paiement</p>
                  <p className="text-gray-900">{selectedParticipation.paymentPhone}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Montant</p>
                  <p className="text-gray-900">{formatCurrency(selectedParticipation.amount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Statut</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedParticipation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedParticipation.status === 'validated' ? 'bg-green-100 text-green-800' :
                    selectedParticipation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedParticipation.status === 'pending' ? 'En attente' :
                     selectedParticipation.status === 'validated' ? 'Validée' :
                     selectedParticipation.status === 'rejected' ? 'Rejetée' :
                     'Terminée'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Date de soumission</p>
                  <p className="text-gray-900">
                    {format(new Date(selectedParticipation.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </p>
                </div>
                {selectedParticipation.validatedAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Date de validation</p>
                    <p className="text-gray-900">
                      {format(new Date(selectedParticipation.validatedAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </p>
                  </div>
                )}
              </div>
              
              {selectedParticipation.validationNotes && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Notes de validation</p>
                  <p className="text-gray-900">{selectedParticipation.validationNotes}</p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setSelectedParticipation(null)}
                className="btn btn-outline"
              >
                Fermer
              </button>
              {selectedParticipation.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleValidate(selectedParticipation.id, 'validate');
                      setSelectedParticipation(null);
                    }}
                    className="btn btn-success"
                  >
                    Valider
                  </button>
                  <button
                    onClick={() => {
                      handleValidate(selectedParticipation.id, 'reject');
                      setSelectedParticipation(null);
                    }}
                    className="btn btn-danger"
                  >
                    Rejeter
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminParticipations;
