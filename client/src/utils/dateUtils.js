import { format, isAfter, isBefore, addDays, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

// Formater une date en français
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  return format(new Date(date), formatStr, { locale: fr });
};

// Formater une date avec l'heure
export const formatDateTime = (date) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: fr });
};

// Vérifier si une date est dans le futur
export const isFuture = (date) => {
  return isAfter(new Date(date), new Date());
};

// Vérifier si une date est dans le passé
export const isPast = (date) => {
  return isBefore(new Date(date), new Date());
};

// Calculer le temps restant
export const getTimeRemaining = (endDate) => {
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end - now;
  
  if (diffTime <= 0) return 'Terminé';
  
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.ceil(diffTime / (1000 * 60));
  
  if (diffDays > 1) return `${diffDays} jours`;
  if (diffHours > 1) return `${diffHours} heures`;
  return `${diffMinutes} minutes`;
};

// Formater une devise en FCFA
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(amount);
};

// Formater un numéro de téléphone ivoirien
export const formatPhoneNumber = (phone) => {
  let cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('0')) {
    cleaned = '+225' + cleaned.substring(1);
  } else if (!cleaned.startsWith('225')) {
    cleaned = '+225' + cleaned;
  } else {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
};

// Valider un numéro de téléphone ivoirien
export const validateIvorianPhone = (phone) => {
  const phoneRegex = /^\+225[0-9]{8}$/;
  return phoneRegex.test(formatPhoneNumber(phone));
};

// Obtenir la date de début et fin du mois
export const getMonthRange = (date = new Date()) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start, end };
};

// Obtenir la date de début et fin de la semaine
export const getWeekRange = (date = new Date()) => {
  const start = subDays(date, date.getDay());
  const end = addDays(start, 6);
  return { start, end };
};

