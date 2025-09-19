import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, UserCheck, UserX, Key, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminUsers = () => {
  const { api } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { role: filter } : {};
      const response = await api.get('/admin/users', { params });
      setUsers(response.data.users);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir ${currentStatus ? 'désactiver' : 'activer'} cet utilisateur ?`)) {
      return;
    }

    try {
      const response = await api.put(`/admin/users/${userId}/status`, {
        isActive: !currentStatus
      });
      
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isActive: !currentStatus }
          : user
      ));
      
      alert(`Utilisateur ${!currentStatus ? 'activé' : 'désactivé'} avec succès !`);
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour du statut';
      alert(`Erreur: ${errorMessage}`);
    }
  };

  const handleResetPassword = async (userId) => {
    const newPassword = prompt('Entrez le nouveau mot de passe (minimum 6 caractères):');
    if (!newPassword || newPassword.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      await api.put(`/admin/users/${userId}/reset-password`, {
        newPassword
      });
      alert('Mot de passe réinitialisé avec succès');
    } catch (err) {
      console.error('Erreur lors de la réinitialisation:', err);
      alert('Erreur lors de la réinitialisation du mot de passe');
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      user.fullName.toLowerCase().includes(searchLower) ||
      user.phone.includes(searchTerm)
    );
  });

  const filters = [
    { id: 'all', name: 'Tous' },
    { id: 'user', name: 'Utilisateurs' },
    { id: 'admin', name: 'Administrateurs' }
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
        <p className="text-danger-600">{error}</p>
        <button
          onClick={fetchUsers}
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
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 mt-2">Gérez les comptes utilisateurs de la plateforme</p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
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
        
        <div className="flex items-center space-x-2 flex-1">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Utilisateurs actifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Utilisateurs inactifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => !u.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur</h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'Aucun utilisateur ne correspond à votre recherche.'
              : 'Il n\'y a actuellement aucun utilisateur.'
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
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Membre depuis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                        <p className="text-sm text-gray-500">{user.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{user.totalParticipations}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">
                        {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: fr })}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Voir
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id, user.isActive)}
                          className={`${
                            user.isActive 
                              ? 'text-red-600 hover:text-red-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {user.isActive ? 'Désactiver' : 'Activer'}
                        </button>
                        <button
                          onClick={() => handleResetPassword(user.id)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de détails utilisateur */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails de l'utilisateur</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Nom complet</p>
                  <p className="text-gray-900">{selectedUser.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Téléphone</p>
                  <p className="text-gray-900">{selectedUser.phone}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rôle</p>
                  <p className="text-gray-900">
                    {selectedUser.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Statut</p>
                  <p className="text-gray-900">
                    {selectedUser.isActive ? 'Actif' : 'Inactif'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total participations</p>
                  <p className="text-gray-900">{selectedUser.totalParticipations}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Membre depuis</p>
                  <p className="text-gray-900">
                    {format(new Date(selectedUser.createdAt), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
              
              {selectedUser.lastLogin && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Dernière connexion</p>
                  <p className="text-gray-900">
                    {format(new Date(selectedUser.lastLogin), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setSelectedUser(null)}
                className="btn btn-outline"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  handleToggleStatus(selectedUser.id, selectedUser.isActive);
                  setSelectedUser(null);
                }}
                className={`btn ${
                  selectedUser.isActive ? 'btn-danger' : 'btn-success'
                }`}
              >
                {selectedUser.isActive ? 'Désactiver' : 'Activer'}
              </button>
              <button
                onClick={() => {
                  handleResetPassword(selectedUser.id);
                  setSelectedUser(null);
                }}
                className="btn btn-warning"
              >
                Réinitialiser mot de passe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
