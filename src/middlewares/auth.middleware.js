/**
 * Middlewares d'authentification et d'autorisation.
 * ------------------------------------------------------------
 * 1) `authenticate` : vérifie la présence et la validité du JWT,
 *    puis attache l'utilisateur à `req.user`.
 * 2) `authorize(...roles)` : restreint l'accès à certains rôles.
 *    Doit TOUJOURS être placé après `authenticate`.
 *
 * Exemple :
 *   router.delete('/:id', authenticate, authorize('admin'), controller.remove);
 */
const { User } = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyAccessToken } = require('../services/token.service');

const authenticate = asyncHandler(async (req, _res, next) => {
  // 1. Extraire le jeton de l'en-tête "Authorization: Bearer <token>"
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Jeton d\'authentification manquant');
  }

  // 2. Vérifier la signature et l'expiration
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Jeton expiré' : 'Jeton invalide';
    throw new ApiError(401, message);
  }

  // 3. Vérifier que l'utilisateur existe toujours (il a pu être supprimé)
  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, 'Utilisateur introuvable');

  // 4. Rendre l'utilisateur disponible pour les middlewares/contrôleurs suivants
  req.user = user;
  next();
});

/**
 * Fabrique de middleware : autorise uniquement les rôles listés.
 * @param  {...string} roles ex. authorize('admin') ou authorize('admin', 'user')
 */
const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new ApiError(401, 'Non authentifié'));
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, 'Accès refusé : permissions insuffisantes'));
  }
  next();
};

/**
 * Autorise l'accès si l'utilisateur est admin OU s'il agit sur sa propre ressource.
 * Utile pour : GET/PATCH /api/users/:id
 */
const isSelfOrAdmin = (req, _res, next) => {
  if (req.user.role === 'admin' || req.user.id === req.params.id) return next();
  next(new ApiError(403, 'Accès refusé'));
};

module.exports = { authenticate, authorize, isSelfOrAdmin };
