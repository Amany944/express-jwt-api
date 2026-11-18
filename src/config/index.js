/**
 * Configuration centralisée de l'application.
 * ------------------------------------------------------------
 * Toutes les variables d'environnement sont lues ICI et nulle part
 * ailleurs. Le reste du code importe simplement `config`.
 * Avantage : un seul endroit à modifier, et une validation au démarrage.
 */
require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/express_jwt_api',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  corsOrigin: (process.env.CORS_ORIGIN || '*').split(',').map((o) => o.trim()),
};

// Validation minimale : on refuse de démarrer sans secrets JWT.
// Mieux vaut planter au démarrage que tourner avec une faille.
if (!config.jwt.accessSecret || !config.jwt.refreshSecret) {
  throw new Error(
    'JWT_ACCESS_SECRET et JWT_REFRESH_SECRET doivent être définis (voir .env.example).'
  );
}

module.exports = config;
