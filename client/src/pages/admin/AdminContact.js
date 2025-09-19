import React, { useState, useEffect } from 'react';
import { MessageCircle, Eye, Reply, Trash2, Clock, CheckCircle, Key, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const AdminContact = () => {
  const { api } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submittingPasswordReset, setSubmittingPasswordReset] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }
      
      const response = await api.get(`/contact?${params.toString()}`);
      setMessages(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      toast.error('Erreur lors du chargement des messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await api.put(`/contact/${messageId}/read`);
      toast.success('Message marqué comme lu');
      fetchMessages();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      return;
    }

    try {
      await api.delete(`/contact/${messageId}`);
      toast.success('Message supprimé');
      fetchMessages();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du message');
    }
  };

  const handleSendResponse = async (e) => {
    e.preventDefault();
    
    if (!responseText.trim()) {
      toast.error('Veuillez saisir une réponse');
      return;
    }

    setSubmittingResponse(true);
    
    try {
      await api.put(`/contact/${selectedMessage.id}/response`, {
        response: responseText.trim()
      });
      
      toast.success('Réponse envoyée avec succès');
      setShowResponseModal(false);
      setResponseText('');
      setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la réponse:', error);
      toast.error('Erreur lors de l\'envoi de la réponse');
    }
    
    setSubmittingResponse(false);
  };

  const handleFindUser = async (phone) => {
    try {
      const response = await api.get(`/admin/users/find-by-phone/${phone}`);
      return response.user;
    } catch (error) {
      console.error('Erreur lors de la recherche d\'utilisateur:', error);
      return null;
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!newPassword || newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setSubmittingPasswordReset(true);
    
    try {
      await api.put(`/admin/users/${selectedUser.id}/reset-password`, {
        newPassword: newPassword
      });
      
      toast.success(`Mot de passe réinitialisé avec succès pour ${selectedUser.fullName}`);
      setShowPasswordResetModal(false);
      setNewPassword('');
      setConfirmPassword('');
      setSelectedUser(null);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      toast.error('Erreur lors de la réinitialisation du mot de passe');
    }
    
    setSubmittingPasswordReset(false);
  };

  const openPasswordResetModal = async (phone) => {
    const user = await handleFindUser(phone);
    if (user) {
      setSelectedUser(user);
      setShowPasswordResetModal(true);
    } else {
      toast.error('Aucun utilisateur trouvé avec ce numéro de téléphone');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'read':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'replied':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'read':
        return 'Lu';
      case 'replied':
        return 'Répondu';
      default:
        return 'Inconnu';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <MessageCircle className="h-6 w-6 mr-2 text-blue-600" />
            Messages de Contact
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez les messages des utilisateurs (mots de passe oubliés, etc.)
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex space-x-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tous ({messages.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          En attente ({messages.filter(m => m.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'read'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Lus ({messages.filter(m => m.status === 'read').length})
        </button>
        <button
          onClick={() => setFilter('replied')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'replied'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Répondus ({messages.filter(m => m.status === 'replied').length})
        </button>
      </div>

      {/* Liste des messages */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun message
            </h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'Aucun message de contact reçu pour le moment.'
                : `Aucun message avec le statut "${getStatusText(filter)}".`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {messages.map((message) => (
              <div key={message.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-medium text-gray-900">
                        {message.phone}
                      </span>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(message.status)}
                        <span className="text-sm text-gray-600">
                          {getStatusText(message.status)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-3">
                      {message.message}
                    </p>
                    
                    {message.adminResponse && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <h4 className="text-sm font-medium text-blue-900 mb-1">
                          Votre réponse :
                        </h4>
                        <p className="text-sm text-blue-800">
                          {message.adminResponse}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    {message.status === 'pending' && (
                      <button
                        onClick={() => handleMarkAsRead(message.id)}
                        className="btn btn-secondary btn-sm"
                        title="Marquer comme lu"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    
                    {/* Bouton de réinitialisation de mot de passe */}
                    {(message.message.toLowerCase().includes('mot de passe') || 
                      message.message.toLowerCase().includes('password') ||
                      message.message.toLowerCase().includes('oublié')) && (
                      <button
                        onClick={() => openPasswordResetModal(message.phone)}
                        className="btn btn-warning btn-sm"
                        title="Réinitialiser le mot de passe"
                      >
                        <Key className="h-4 w-4" />
                      </button>
                    )}
                    
                    {message.status !== 'replied' && (
                      <button
                        onClick={() => {
                          setSelectedMessage(message);
                          setShowResponseModal(true);
                        }}
                        className="btn btn-primary btn-sm"
                        title="Répondre"
                      >
                        <Reply className="h-4 w-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      className="btn btn-danger btn-sm"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de réponse */}
      {showResponseModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Répondre à {selectedMessage.phone}
              </h3>
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setSelectedMessage(null);
                  setResponseText('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSendResponse} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message original :
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
                  {selectedMessage.message}
                </div>
              </div>

              <div>
                <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-2">
                  Votre réponse :
                </label>
                <textarea
                  id="response"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Tapez votre réponse ici..."
                  rows={4}
                  className="input w-full resize-none"
                  disabled={submittingResponse}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowResponseModal(false);
                    setSelectedMessage(null);
                    setResponseText('');
                  }}
                  className="btn btn-secondary flex-1"
                  disabled={submittingResponse}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingResponse}
                  className="btn btn-primary flex-1"
                >
                  {submittingResponse ? (
                    <div className="flex items-center justify-center">
                      <div className="loading-spinner w-4 h-4 mr-2"></div>
                      Envoi...
                    </div>
                  ) : (
                    'Envoyer la réponse'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de réinitialisation de mot de passe */}
      {showPasswordResetModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Key className="h-5 w-5 mr-2 text-orange-600" />
                Réinitialiser le mot de passe
              </h3>
              <button
                onClick={() => {
                  setShowPasswordResetModal(false);
                  setSelectedUser(null);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handlePasswordReset} className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Utilisateur sélectionné :</h4>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">{selectedUser.fullName}</p>
                    <p className="text-xs text-blue-600">{selectedUser.phone}</p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Saisissez le nouveau mot de passe"
                  className="input w-full"
                  disabled={submittingPasswordReset}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Le mot de passe doit contenir au moins 6 caractères
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmez le nouveau mot de passe"
                  className="input w-full"
                  disabled={submittingPasswordReset}
                  required
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Attention
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Cette action réinitialisera définitivement le mot de passe de l'utilisateur. Assurez-vous de communiquer le nouveau mot de passe à l'utilisateur de manière sécurisée.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordResetModal(false);
                    setSelectedUser(null);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="btn btn-secondary flex-1"
                  disabled={submittingPasswordReset}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingPasswordReset}
                  className="btn btn-warning flex-1"
                >
                  {submittingPasswordReset ? (
                    <div className="flex items-center justify-center">
                      <div className="loading-spinner w-4 h-4 mr-2"></div>
                      Réinitialisation...
                    </div>
                  ) : (
                    'Réinitialiser le mot de passe'
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

export default AdminContact;
