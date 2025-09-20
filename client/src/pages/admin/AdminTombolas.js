import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Gift, Plus, Edit, Trash2, Eye, Calendar, Users, DollarSign, X } from 'lucide-react';
import { format, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

const AdminTombolas = () => {
  const { api } = useAuth();
  const [tombolas, setTombolas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTombola, setEditingTombola] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prizeAmount: '',
    participationPrice: '',
    maxParticipants: '',
    endDate: ''
  });
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    prizeAmount: '',
    participationPrice: '',
    maxParticipants: '',
    endDate: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchTombolas();
  }, []);

  const fetchTombolas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tombolas');
      setTombolas(response.data.tombolas);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des tombolas:', err);
      setError('Erreur lors du chargement des tombolas');
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

  const canEdit = (tombola) => {
    return !tombola.isDrawn;
  };

  const canDelete = (tombola) => {
    return !tombola.isDrawn && tombola.totalParticipations === 0;
  };

  const canDraw = (tombola) => {
    const now = new Date();
    const endDate = new Date(tombola.endDate);
    return !tombola.isDrawn && endDate <= now && tombola.totalParticipations > 0;
  };

  const handleDelete = async (tombolaId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette tombola ?')) {
      return;
    }

    try {
      await api.delete(`/tombolas/${tombolaId}`);
      setTombolas(tombolas.filter(t => t.id !== tombolaId));
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };

  const handleDraw = async (tombolaId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir effectuer le tirage de cette tombola ? Cette action est irréversible.')) {
      return;
    }

    try {
      const response = await api.post(`/tombolas/${tombolaId}/draw`);
      // Mettre à jour la tombola dans la liste
      setTombolas(tombolas.map(t => 
        t.id === tombolaId 
          ? { ...t, isDrawn: true, status: 'drawn', drawDate: new Date() }
          : t
      ));
      toast.success('Tirage effectué avec succès !');
    } catch (err) {
      console.error('Erreur lors du tirage:', err);
      toast.error('Erreur lors du tirage');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur du champ modifié
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur du champ modifié
    if (editFormErrors[name]) {
      setEditFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Le titre est requis';
    } else if (formData.title.trim().length < 5) {
      errors.title = 'Le titre doit contenir au moins 5 caractères';
    }

    if (!formData.description.trim()) {
      errors.description = 'La description est requise';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'La description doit contenir au moins 10 caractères';
    }

    if (!formData.prizeAmount) {
      errors.prizeAmount = 'Le montant de la cagnotte est requis';
    } else if (parseInt(formData.prizeAmount) < 100) {
      errors.prizeAmount = 'La cagnotte doit être d\'au moins 100 FCFA';
    }

    if (!formData.participationPrice) {
      errors.participationPrice = 'Le prix de participation est requis';
    } else if (parseInt(formData.participationPrice) < 50) {
      errors.participationPrice = 'Le prix de participation doit être d\'au moins 50 FCFA';
    }

    if (formData.maxParticipants && parseInt(formData.maxParticipants) < 2) {
      errors.maxParticipants = 'Le nombre maximum de participants doit être d\'au moins 2';
    }

    if (!formData.endDate) {
      errors.endDate = 'La date de fin est requise';
    } else if (new Date(formData.endDate) <= new Date()) {
      errors.endDate = 'La date de fin doit être dans le futur';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const tombolaData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        prizeAmount: parseInt(formData.prizeAmount),
        participationPrice: parseInt(formData.participationPrice),
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        endDate: new Date(formData.endDate).toISOString()
      };

      const response = await api.post('/tombolas', tombolaData);
      setTombolas([...tombolas, response.data.tombola]);
      setShowCreateModal(false);
      resetForm();
      toast.success('Tombola créée avec succès !');
    } catch (err) {
      console.error('Erreur lors de la création:', err);
      const message = err.response?.data?.message || 'Erreur lors de la création de la tombola';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      prizeAmount: '',
      participationPrice: '',
      maxParticipants: '',
      endDate: ''
    });
    setFormErrors({});
  };

  const resetEditForm = () => {
    setEditFormData({
      title: '',
      description: '',
      prizeAmount: '',
      participationPrice: '',
      maxParticipants: '',
      endDate: ''
    });
    setEditFormErrors({});
  };

  const closeModal = () => {
    setShowCreateModal(false);
    resetForm();
  };

  const openEditModal = (tombola) => {
    setEditingTombola(tombola);
    setEditFormData({
      title: tombola.title,
      description: tombola.description,
      prizeAmount: tombola.prizeAmount,
      participationPrice: tombola.participationPrice,
      maxParticipants: tombola.maxParticipants || '',
      endDate: tombola.endDate ? new Date(tombola.endDate).toISOString().slice(0, 16) : ''
    });
    setEditFormErrors({});
  };

  const closeEditModal = () => {
    setEditingTombola(null);
    resetEditForm();
  };

  const validateEditForm = () => {
    const errors = {};

    if (!editFormData.title.trim()) {
      errors.title = 'Le titre est requis';
    }

    if (!editFormData.description.trim()) {
      errors.description = 'La description est requise';
    }

    if (!editFormData.prizeAmount || editFormData.prizeAmount < 100) {
      errors.prizeAmount = 'Le montant de la cagnotte doit être d\'au moins 100 FCFA';
    }

    if (!editFormData.participationPrice || editFormData.participationPrice < 50) {
      errors.participationPrice = 'Le prix de participation doit être d\'au moins 50 FCFA';
    }

    if (editFormData.maxParticipants && editFormData.maxParticipants < 2) {
      errors.maxParticipants = 'Le nombre minimum de participants est 2';
    }

    if (!editFormData.endDate) {
      errors.endDate = 'La date de fin est requise';
    } else {
      const endDate = new Date(editFormData.endDate);
      const now = new Date();
      if (endDate <= now) {
        errors.endDate = 'La date de fin doit être dans le futur';
      }
    }

    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEditForm()) {
      return;
    }

    try {
      setIsEditing(true);
      const response = await api.put(`/tombolas/${editingTombola.id}`, editFormData);
      
      // Mettre à jour la tombola dans la liste
      setTombolas(tombolas.map(t => 
        t.id === editingTombola.id 
          ? { ...t, ...response.data.tombola }
          : t
      ));
      
      toast.success('Tombola mise à jour avec succès !');
      closeEditModal();
      
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      if (err.response?.data?.errors) {
        setEditFormErrors(err.response.data.errors);
      } else {
        toast.error('Erreur lors de la mise à jour de la tombola');
      }
    } finally {
      setIsEditing(false);
    }
  };

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
          onClick={fetchTombolas}
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
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Tombolas</h1>
          <p className="text-gray-600 mt-2">Créez et gérez les tombolas de la plateforme</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle tombola
        </button>
      </div>

      {/* Liste des tombolas */}
      {tombolas.length === 0 ? (
        <div className="text-center py-12">
          <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tombola</h3>
          <p className="text-gray-600 mb-6">Créez votre première tombola pour commencer.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            Créer une tombola
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tombolas.map((tombola) => (
            <div key={tombola.id} className="card p-6 hover:shadow-lg transition-shadow">
              {/* Header de la carte */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {tombola.title}
                  </h3>
                  {getStatusBadge(tombola)}
                </div>
                <Gift className="w-8 h-8 text-blue-600" />
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {tombola.description}
              </p>

              {/* Informations */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Cagnotte
                  </div>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(tombola.prizeAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    Participation
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(tombola.participationPrice)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Date de fin
                  </div>
                  <span className="font-semibold text-gray-900">
                    {format(new Date(tombola.endDate), 'dd/MM/yyyy', { locale: fr })}
                  </span>
                </div>

                {tombola.totalParticipations > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
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
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {/* Voir détails */}}
                  className="btn btn-outline btn-sm"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Voir
                </button>
                
                {canEdit(tombola) && (
                  <button
                    onClick={() => openEditModal(tombola)}
                    className="btn btn-outline btn-sm"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Modifier
                  </button>
                )}
                
                {canDelete(tombola) && (
                  <button
                    onClick={() => handleDelete(tombola.id)}
                    className="btn btn-danger btn-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Supprimer
                  </button>
                )}
                
                {canDraw(tombola) && (
                  <button
                    onClick={() => handleDraw(tombola.id)}
                    className="btn btn-warning btn-sm"
                  >
                    Tirage
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Créer une tombola</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Titre */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de la tombola *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ex: Tombola Spéciale Noël"
                  className={`input ${formErrors.title ? 'input-error' : ''}`}
                  disabled={isSubmitting}
                />
                {formErrors.title && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez la tombola, les conditions de participation..."
                  rows={4}
                  className={`input ${formErrors.description ? 'input-error' : ''}`}
                  disabled={isSubmitting}
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                )}
              </div>

              {/* Montant de la cagnotte */}
              <div>
                <label htmlFor="prizeAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Montant de la cagnotte (FCFA) *
                </label>
                <input
                  type="number"
                  id="prizeAmount"
                  name="prizeAmount"
                  value={formData.prizeAmount}
                  onChange={handleInputChange}
                  placeholder="10000"
                  min="100"
                  className={`input ${formErrors.prizeAmount ? 'input-error' : ''}`}
                  disabled={isSubmitting}
                />
                {formErrors.prizeAmount && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.prizeAmount}</p>
                )}
              </div>

              {/* Prix de participation */}
              <div>
                <label htmlFor="participationPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Prix de participation (FCFA) *
                </label>
                <input
                  type="number"
                  id="participationPrice"
                  name="participationPrice"
                  value={formData.participationPrice}
                  onChange={handleInputChange}
                  placeholder="500"
                  min="50"
                  className={`input ${formErrors.participationPrice ? 'input-error' : ''}`}
                  disabled={isSubmitting}
                />
                {formErrors.participationPrice && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.participationPrice}</p>
                )}
              </div>

              {/* Nombre maximum de participants */}
              <div>
                <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre maximum de participants (optionnel)
                </label>
                <input
                  type="number"
                  id="maxParticipants"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  placeholder="100"
                  min="2"
                  className={`input ${formErrors.maxParticipants ? 'input-error' : ''}`}
                  disabled={isSubmitting}
                />
                {formErrors.maxParticipants && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.maxParticipants}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Laissez vide pour un nombre illimité
                </p>
              </div>

              {/* Date de fin */}
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin *
                </label>
                <input
                  type="datetime-local"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().slice(0, 16)}
                  className={`input ${formErrors.endDate ? 'input-error' : ''}`}
                  disabled={isSubmitting}
                />
                {formErrors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.endDate}</p>
                )}
              </div>

              {/* Boutons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-outline flex-1"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="loading-spinner w-4 h-4 mr-2"></div>
                      Création...
                    </div>
                  ) : (
                    'Créer la tombola'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {editingTombola && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Modifier la tombola</h3>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              {/* Titre */}
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de la tombola *
                </label>
                <input
                  type="text"
                  id="edit-title"
                  name="title"
                  value={editFormData.title}
                  onChange={handleEditInputChange}
                  placeholder="Ex: Tombola Spéciale Noël"
                  className={`input ${editFormErrors.title ? 'input-error' : ''}`}
                  disabled={isEditing}
                />
                {editFormErrors.title && (
                  <p className="mt-1 text-sm text-red-600">{editFormErrors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  placeholder="Décrivez la tombola, les conditions de participation..."
                  rows={4}
                  className={`input ${editFormErrors.description ? 'input-error' : ''}`}
                  disabled={isEditing}
                />
                {editFormErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{editFormErrors.description}</p>
                )}
              </div>

              {/* Montant de la cagnotte */}
              <div>
                <label htmlFor="edit-prizeAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Montant de la cagnotte (FCFA) *
                </label>
                <input
                  type="number"
                  id="edit-prizeAmount"
                  name="prizeAmount"
                  value={editFormData.prizeAmount}
                  onChange={handleEditInputChange}
                  placeholder="10000"
                  min="100"
                  className={`input ${editFormErrors.prizeAmount ? 'input-error' : ''}`}
                  disabled={isEditing}
                />
                {editFormErrors.prizeAmount && (
                  <p className="mt-1 text-sm text-red-600">{editFormErrors.prizeAmount}</p>
                )}
              </div>

              {/* Prix de participation */}
              <div>
                <label htmlFor="edit-participationPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Prix de participation (FCFA) *
                </label>
                <input
                  type="number"
                  id="edit-participationPrice"
                  name="participationPrice"
                  value={editFormData.participationPrice}
                  onChange={handleEditInputChange}
                  placeholder="500"
                  min="50"
                  className={`input ${editFormErrors.participationPrice ? 'input-error' : ''}`}
                  disabled={isEditing}
                />
                {editFormErrors.participationPrice && (
                  <p className="mt-1 text-sm text-red-600">{editFormErrors.participationPrice}</p>
                )}
              </div>

              {/* Nombre maximum de participants */}
              <div>
                <label htmlFor="edit-maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre maximum de participants (optionnel)
                </label>
                <input
                  type="number"
                  id="edit-maxParticipants"
                  name="maxParticipants"
                  value={editFormData.maxParticipants}
                  onChange={handleEditInputChange}
                  placeholder="100"
                  min="2"
                  className={`input ${editFormErrors.maxParticipants ? 'input-error' : ''}`}
                  disabled={isEditing}
                />
                {editFormErrors.maxParticipants && (
                  <p className="mt-1 text-sm text-red-600">{editFormErrors.maxParticipants}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Laissez vide pour un nombre illimité
                </p>
              </div>

              {/* Date et heure de fin */}
              <div>
                <label htmlFor="edit-endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Date et heure de fin *
                </label>
                <input
                  type="datetime-local"
                  id="edit-endDate"
                  name="endDate"
                  value={editFormData.endDate}
                  onChange={handleEditInputChange}
                  min={new Date().toISOString().slice(0, 16)}
                  className={`input ${editFormErrors.endDate ? 'input-error' : ''}`}
                  disabled={isEditing}
                />
                {editFormErrors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{editFormErrors.endDate}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Vous pouvez modifier la date et l'heure de fin même si la tombola a déjà des participants
                </p>
              </div>

              {/* Boutons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="btn btn-outline flex-1"
                  disabled={isEditing}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={isEditing}
                >
                  {isEditing ? (
                    <div className="flex items-center justify-center">
                      <div className="loading-spinner w-4 h-4 mr-2"></div>
                      Mise à jour...
                    </div>
                  ) : (
                    'Mettre à jour'
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

export default AdminTombolas;
