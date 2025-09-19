const fs = require('fs');
const path = require('path');

// Créer le dossier logs s'il n'existe pas
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configuration des logs
const logLevels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const currentLevel = process.env.LOG_LEVEL || 'INFO';

// Fonction de formatage des logs
const formatLog = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...meta
  };
  
  return JSON.stringify(logEntry);
};

// Fonction d'écriture dans les fichiers
const writeToFile = (filename, content) => {
  const filePath = path.join(logsDir, filename);
  fs.appendFileSync(filePath, content + '\n');
};

// Logger principal
const logger = {
  error: (message, meta = {}) => {
    if (logLevels[currentLevel] >= logLevels.ERROR) {
      const log = formatLog('ERROR', message, meta);
      console.error('❌', message, meta);
      writeToFile('error.log', log);
    }
  },

  warn: (message, meta = {}) => {
    if (logLevels[currentLevel] >= logLevels.WARN) {
      const log = formatLog('WARN', message, meta);
      console.warn('⚠️', message, meta);
      writeToFile('warn.log', log);
    }
  },

  info: (message, meta = {}) => {
    if (logLevels[currentLevel] >= logLevels.INFO) {
      const log = formatLog('INFO', message, meta);
      console.log('ℹ️', message, meta);
      writeToFile('info.log', log);
    }
  },

  debug: (message, meta = {}) => {
    if (logLevels[currentLevel] >= logLevels.DEBUG) {
      const log = formatLog('DEBUG', message, meta);
      console.log('🐛', message, meta);
      writeToFile('debug.log', log);
    }
  },

  // Logs spécifiques à l'application
  auth: (message, meta = {}) => {
    logger.info(`[AUTH] ${message}`, meta);
    writeToFile('auth.log', formatLog('INFO', `[AUTH] ${message}`, meta));
  },

  participation: (message, meta = {}) => {
    logger.info(`[PARTICIPATION] ${message}`, meta);
    writeToFile('participation.log', formatLog('INFO', `[PARTICIPATION] ${message}`, meta));
  },

  tombola: (message, meta = {}) => {
    logger.info(`[TOMBOLA] ${message}`, meta);
    writeToFile('tombola.log', formatLog('INFO', `[TOMBOLA] ${message}`, meta));
  },

  admin: (message, meta = {}) => {
    logger.info(`[ADMIN] ${message}`, meta);
    writeToFile('admin.log', formatLog('INFO', `[ADMIN] ${message}`, meta));
  },

  security: (message, meta = {}) => {
    logger.warn(`[SECURITY] ${message}`, meta);
    writeToFile('security.log', formatLog('WARN', `[SECURITY] ${message}`, meta));
  }
};

// Middleware pour logger les requêtes HTTP
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    };

    if (res.statusCode >= 400) {
      logger.error('HTTP Request Error', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
};

// Fonction pour nettoyer les anciens logs
const cleanOldLogs = (daysToKeep = 30) => {
  const files = fs.readdirSync(logsDir);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  files.forEach(file => {
    const filePath = path.join(logsDir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.mtime < cutoffDate) {
      fs.unlinkSync(filePath);
      logger.info(`Ancien fichier de log supprimé: ${file}`);
    }
  });
};

// Nettoyer les logs au démarrage
cleanOldLogs();

module.exports = {
  logger,
  requestLogger,
  cleanOldLogs
};

