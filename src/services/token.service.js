/**
 * Service de gestion des jetons JWT.
 * ------------------------------------------------------------
 * Deux types de jetons :
 *  - Access token  : courte durée (ex. 15 min), envoyé à chaque requête
 *                    dans l'en-tête `Authorization: Bearer <token>`.
 *  - Refresh token : longue durée (ex. 7 j), sert uniquement à obtenir
 *                    un nouvel access token via POST /api/auth/refresh.
 *
 * Les deux sont signés avec des secrets DIFFÉRENTS : un refresh token
 * ne peut donc pas être utilisé comme access token, et inversement.
 */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');

/** Génère un access token contenant l'id (sub) et le rôle de l'utilisateur. */
function generateAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });
}

/**
 * Génère un refresh token (payload minimal : seulement l'id).
 * `jwtid` aléatoire : garantit qu'un nouveau jeton est toujours différent
 * du précédent, même s'il est émis dans la même seconde (rotation fiable).
 */
function generateRefreshToken(user) {
  return jwt.sign({ sub: user.id }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    jwtid: crypto.randomUUID(),
  });
}

/** Vérifie un access token ; lève une erreur si invalide ou expiré. */
const verifyAccessToken = (token) => jwt.verify(token, config.jwt.accessSecret);

/** Vérifie un refresh token ; lève une erreur si invalide ou expiré. */
const verifyRefreshToken = (token) => jwt.verify(token, config.jwt.refreshSecret);

/**
 * Hash SHA-256 d'un refresh token pour stockage en base.
 * On ne stocke jamais le jeton brut : en cas de fuite de la base,
 * les jetons ne seraient pas réutilisables.
 */
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
};
