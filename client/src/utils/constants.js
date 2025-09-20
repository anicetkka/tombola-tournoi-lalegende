// Constantes de l'application

export const APP_CONFIG = {
  name: 'Tombola Côte d\'Ivoire',
  version: '1.0.0',
  description: 'Plateforme sécurisée de tombola en ligne',
  supportEmail: 'support@tombola-ci.com',
  supportPhone: '+225 01 234 5678'
};

export const PAYMENT_METHODS = {
  WAVE: 'wave',
  ORANGE_MONEY: 'orange_money'
};

export const PAYMENT_ACCOUNTS = {
  WAVE: '+2250703909441',
  ORANGE_MONEY: '+2250703909441'
};

export const PARTICIPATION_STATUS = {
  PENDING: 'pending',
  VALIDATED: 'validated',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
};

export const TOMBOLA_STATUS = {
  ACTIVE: 'active',
  ENDED: 'ended',
  DRAWN: 'drawn',
  CANCELLED: 'cancelled'
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

export const STATUS_LABELS = {
  [PARTICIPATION_STATUS.PENDING]: 'En attente',
  [PARTICIPATION_STATUS.VALIDATED]: 'Participation validée',
  [PARTICIPATION_STATUS.REJECTED]: 'Participation rejetée',
  [PARTICIPATION_STATUS.COMPLETED]: 'Tombola validée',
  [TOMBOLA_STATUS.ACTIVE]: 'Active',
  [TOMBOLA_STATUS.ENDED]: 'Terminée',
  [TOMBOLA_STATUS.DRAWN]: 'Tirée',
  [TOMBOLA_STATUS.CANCELLED]: 'Annulée'
};

export const STATUS_COLORS = {
  [PARTICIPATION_STATUS.PENDING]: {
    text: 'text-yellow-600',
    bg: 'bg-yellow-100'
  },
  [PARTICIPATION_STATUS.VALIDATED]: {
    text: 'text-green-600',
    bg: 'bg-green-100'
  },
  [PARTICIPATION_STATUS.REJECTED]: {
    text: 'text-red-600',
    bg: 'bg-red-100'
  },
  [PARTICIPATION_STATUS.COMPLETED]: {
    text: 'text-blue-600',
    bg: 'bg-blue-100'
  },
  [TOMBOLA_STATUS.ACTIVE]: {
    text: 'text-green-600',
    bg: 'bg-green-100'
  },
  [TOMBOLA_STATUS.ENDED]: {
    text: 'text-yellow-600',
    bg: 'bg-yellow-100'
  },
  [TOMBOLA_STATUS.DRAWN]: {
    text: 'text-blue-600',
    bg: 'bg-blue-100'
  },
  [TOMBOLA_STATUS.CANCELLED]: {
    text: 'text-red-600',
    bg: 'bg-red-100'
  }
};

export const VALIDATION_RULES = {
  PHONE: {
    pattern: /^\+225[0-9]{10}$/,
    message: 'Format de numéro ivoirien invalide (+225XXXXXXXXXX)'
  },
  PASSWORD: {
    minLength: 6,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
  },
  FULL_NAME: {
    minLength: 2,
    maxLength: 100,
    message: 'Le nom doit contenir entre 2 et 100 caractères'
  },
  TRANSACTION_ID: {
    minLength: 5,
    maxLength: 50,
    message: 'L\'ID de transaction doit contenir entre 5 et 50 caractères'
  }
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY: '/auth/verify',
    ME: '/auth/me'
  },
  USERS: {
    PROFILE: '/users/profile',
    PARTICIPATIONS: '/users/participations',
    STATS: '/users/stats',
    CHANGE_PASSWORD: '/users/change-password'
  },
  TOMBOLAS: {
    LIST: '/tombolas',
    DETAIL: (id) => `/tombolas/${id}`,
    CREATE: '/tombolas',
    UPDATE: (id) => `/tombolas/${id}`,
    DELETE: (id) => `/tombolas/${id}`,
    DRAW: (id) => `/tombolas/${id}/draw`,
    STATS: (id) => `/tombolas/${id}/stats`
  },
  PARTICIPATIONS: {
    CREATE: '/participations',
    LIST: '/participations',
    DETAIL: (id) => `/participations/${id}`,
    VALIDATE: (id) => `/participations/${id}/validate`,
    STATS: '/participations/stats/overview'
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    USER_TOGGLE_STATUS: (id) => `/admin/users/${id}/toggle-status`,
    USER_RESET_PASSWORD: (id) => `/admin/users/${id}/reset-password`,
    STATS: '/admin/stats/detailed',
    EXPORT: '/admin/export/participations'
  }
};

export const ROUTES = {
  HOME: '/',
  TOMBOLAS: '/tombolas',
  TOMBOLA_DETAIL: (id) => `/tombolas/${id}`,
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register'
  },
  USER: {
    PROFILE: '/user/profile',
    PARTICIPATIONS: '/user/participations',
    PARTICIPATE: (tombolaId) => `/user/tombolas/${tombolaId}/participate`
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    TOMBOLAS: '/admin/tombolas',
    PARTICIPATIONS: '/admin/participations',
    USERS: '/admin/users',
    STATS: '/admin/stats'
  }
};

export const TOAST_CONFIG = {
  position: 'top-right',
  duration: 4000,
  style: {
    background: '#363636',
    color: '#fff'
  },
  success: {
    duration: 3000,
    iconTheme: {
      primary: '#22c55e',
      secondary: '#fff'
    }
  },
  error: {
    duration: 5000,
    iconTheme: {
      primary: '#ef4444',
      secondary: '#fff'
    }
  }
};

