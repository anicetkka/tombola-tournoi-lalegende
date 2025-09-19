import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Gift, Phone, CreditCard, FileText, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

const ParticipatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api, user } = useAuth();
  const [tombola, setTombola] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    transactionId: '',
    paymentPhone: '',
    paymentMethod: 'wave',
    amount: 0
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchTombola();
  }, [id]);

  const fetchTombola = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tombolas/${id}`);
      const tombolaData = response.data.tombola;
      setTombola(tombolaData);
      setFormData(prev => ({
        ...prev,
        amount: tombolaData.participationPrice
      }));
    } catch (err) {
      console.error('Erreur lors du chargement de la tombola:', err);
      toast.error('Erreur lors du chargement de la tombola');
      navigate('/tombolas');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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

  const formatPhoneNumber = (phone) => {
    let cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
      cleaned = '+225' + cleaned.substring(1);
    } else if (!cleaned.startsWith('225')) {
      cleaned = '+225' + cleaned;
    } else {
      cleaned = '+' + cleaned;
    }
    
    // Limiter à 10 chiffres après +225
    if (cleaned.startsWith('+225') && cleaned.length > 13) {
      cleaned = '+225' + cleaned.substring(4, 14);
    }
    
    return cleaned;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.transactionId.trim()) {
      newErrors.transactionId = 'L\'ID de transaction est requis';
    } else if (formData.transactionId.trim().length < 5) {
      newErrors.transactionId = 'L\'ID de transaction doit contenir au moins 5 caractères';
    }

    if (!formData.paymentPhone.trim()) {
      newErrors.paymentPhone = 'Le numéro de téléphone de paiement est requis';
    } else {
      const formattedPhone = formatPhoneNumber(formData.paymentPhone);
      if (!/^\+225[0-9]{10}$/.test(formattedPhone)) {
        newErrors.paymentPhone = 'Format de numéro ivoirien invalide (+225XXXXXXXXXX)';
      }
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'La méthode de paiement est requise';
    }

    if (parseInt(formData.amount) !== tombola?.participationPrice) {
      newErrors.amount = `Le montant doit être exactement de ${tombola?.participationPrice} FCFA`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    
    try {
      const formattedPhone = formatPhoneNumber(formData.paymentPhone);
      
      const response = await api.post('/participations', {
        tombolaId: id,
        transactionId: formData.transactionId.toUpperCase(),
        paymentPhone: formattedPhone,
        paymentMethod: formData.paymentMethod,
        amount: formData.amount
      });

      const participationNumber = response.data.participation?.participationNumber;
      if (participationNumber) {
        toast.success(`Participation soumise avec succès ! Votre numéro: ${participationNumber}`);
      } else {
        toast.success('Participation soumise avec succès !');
      }
      navigate('/user/participations');
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la soumission';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      </div>
    );
  }

  if (!tombola) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tombola non trouvée</h2>
          <p className="text-gray-600 mb-6">Cette tombola n'existe pas ou n'est plus disponible.</p>
          <button
            onClick={() => navigate('/tombolas')}
            className="btn btn-primary"
          >
            Retour aux tombolas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-primary-600 hover:text-primary-700 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour
        </button>
        
        <div className="flex items-center space-x-3 mb-4">
          <Gift className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Participer à la tombola</h1>
        </div>
        <p className="text-gray-600">{tombola.title}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulaire de participation */}
        <div className="lg:col-span-2">
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Formulaire de participation</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ID de transaction */}
              <div>
                <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-2">
                  ID de transaction *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="transactionId"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleChange}
                    placeholder="Ex: TXN123456789"
                    className={`input pl-10 ${errors.transactionId ? 'input-error' : ''}`}
                    disabled={submitting}
                  />
                </div>
                {errors.transactionId && (
                  <p className="mt-1 text-sm text-red-600">{errors.transactionId}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  L'ID de transaction fourni par Wave ou Orange Money après votre paiement
                </p>
              </div>

              {/* Numéro de téléphone de paiement */}
              <div>
                <label htmlFor="paymentPhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone utilisé pour le paiement *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="paymentPhone"
                    name="paymentPhone"
                    value={formData.paymentPhone}
                    onChange={handleChange}
                    placeholder="+225XXXXXXXX"
                    className={`input pl-10 ${errors.paymentPhone ? 'input-error' : ''}`}
                    disabled={submitting}
                  />
                </div>
                {errors.paymentPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.paymentPhone}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Le numéro de téléphone associé à votre compte Wave ou Orange Money
                </p>
              </div>

              {/* Méthode de paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Méthode de paiement *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.paymentMethod === 'wave' 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="wave"
                      checked={formData.paymentMethod === 'wave'}
                      onChange={handleChange}
                      className="sr-only"
                      disabled={submitting}
                    />
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-bold text-sm">W</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Wave</p>
                        <p className="text-sm text-gray-600">Paiement via Wave</p>
                      </div>
                    </div>
                  </label>

                  <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.paymentMethod === 'orange_money' 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="orange_money"
                      checked={formData.paymentMethod === 'orange_money'}
                      onChange={handleChange}
                      className="sr-only"
                      disabled={submitting}
                    />
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-orange-600 font-bold text-sm">O</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Orange Money</p>
                        <p className="text-sm text-gray-600">Paiement via Orange Money</p>
                      </div>
                    </div>
                  </label>
                </div>
                {errors.paymentMethod && (
                  <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>
                )}
              </div>

              {/* Montant */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Montant payé *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.amount ? 'input-error' : ''}`}
                    disabled={submitting}
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Le montant exact de {formatCurrency(tombola.participationPrice)}
                </p>
              </div>

              {/* Bouton de soumission */}
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-lg w-full"
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner w-5 h-5 mr-2"></div>
                    Soumission...
                  </div>
                ) : (
                  'Soumettre ma participation'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar avec informations */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Résumé de la tombola */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tombola:</span>
                  <span className="font-medium">{tombola.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cagnotte:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(tombola.prizeAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Participation:</span>
                  <span className="font-medium text-blue-600">
                    {formatCurrency(tombola.participationPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date de fin:</span>
                  <span className="font-medium">
                    {format(new Date(tombola.endDate), 'dd/MM/yyyy', { locale: fr })}
                  </span>
                </div>
              </div>
            </div>

            {/* Instructions de paiement */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-primary-600 font-bold text-xs">1</span>
                  </div>
                  <p className="text-gray-600">
                    Effectuez un paiement de <strong>{formatCurrency(tombola.participationPrice)}</strong> 
                    via Wave ou Orange Money
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-primary-600 font-bold text-xs">2</span>
                  </div>
                  <p className="text-gray-600">
                    Conservez l'ID de transaction fourni
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-primary-600 font-bold text-xs">3</span>
                  </div>
                  <p className="text-gray-600">
                    Remplissez ce formulaire avec les détails
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-primary-600 font-bold text-xs">4</span>
                  </div>
                  <p className="text-gray-600">
                    Attendez la validation (24-48h)
                  </p>
                </div>
              </div>
            </div>

            {/* Comptes de paiement */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Comptes de paiement</h3>
              <div className="space-y-3">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center mb-1">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-orange-600 font-bold text-xs">O</span>
                    </div>
                    <span className="font-medium text-gray-900">Orange Money</span>
                  </div>
                  <p className="text-sm text-gray-600">+225 01 234 5678</p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center mb-1">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-blue-600 font-bold text-xs">W</span>
                    </div>
                    <span className="font-medium text-gray-900">Wave</span>
                  </div>
                  <p className="text-sm text-gray-600">+225 01 234 5678</p>
                </div>
              </div>
            </div>

            {/* Avertissement */}
            <div className="card p-6 bg-yellow-50 border-yellow-200">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">Important</h4>
                  <p className="text-sm text-yellow-700">
                    Assurez-vous d'utiliser le montant exact et de conserver l'ID de transaction. 
                    Votre participation sera validée dans les 24-48h.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipatePage;
