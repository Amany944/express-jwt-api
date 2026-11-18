/**
 * Gestion centralisée des erreurs.
 * ------------------------------------------------------------
 * - `notFound` : capture les routes inexistantes (404).
 * - `errorHandler` : transforme toute erreur en réponse JSON homogène.
 *   Un middleware d'erreur Express se reconnaît à ses 4 paramètres.
 */
const ApiError = require('../utils/ApiError');
const config = require('../config');

const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route introuvable : ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  let { statusCode = 500, message, details } = err;

  // Traduction d'erreurs Mongoose/MongoDB courantes en erreurs HTTP lisibles
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Identifiant invalide';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Cette ressource existe déjà';
    details = err.keyValue;
  } else if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Données invalides';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  }

  // Ne jamais exposer les détails d'un bug interne en production
  if (statusCode === 500 && config.env === 'production') message = 'Erreur interne du serveur';
  if (statusCode === 500) console.error(err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
    ...(config.env === 'development' && statusCode === 500 && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
