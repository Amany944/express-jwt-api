/**
 * Contrôleur d'authentification.
 * ------------------------------------------------------------
 * Un contrôleur reçoit la requête déjà validée, appelle le modèle/service,
 * puis renvoie la réponse. Il ne contient pas de logique de routage.
 */
const { User } = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const tokenService = require('../services/token.service');

/** Génère la paire de jetons et enregistre le hash du refresh token. */
async function issueTokens(user) {
  const accessToken = tokenService.generateAccessToken(user);
  const refreshToken = tokenService.generateRefreshToken(user);
  user.refreshTokenHash = tokenService.hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
}

/**
 * POST /api/auth/register
 * Body : { name, email, password }
 */
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // On ne prend PAS `role` depuis le body : un utilisateur ne peut pas
  // s'auto-attribuer le rôle admin à l'inscription.
  const user = await User.create({ name, email, password });
  const tokens = await issueTokens(user);

  res.status(201).json({ success: true, data: { user, ...tokens } });
});

/**
 * POST /api/auth/login
 * Body : { email, password }
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // `+password` : réintègre le champ exclu par défaut (select: false)
  const user = await User.findOne({ email }).select('+password');

  // Message volontairement identique dans les deux cas pour ne pas
  // révéler si un email existe (protection contre l'énumération).
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Email ou mot de passe incorrect');
  }

  const tokens = await issueTokens(user);
  res.json({ success: true, data: { user, ...tokens } });
});

/**
 * POST /api/auth/refresh
 * Body : { refreshToken }
 * Renvoie une nouvelle paire de jetons (rotation du refresh token).
 */
exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  let payload;
  try {
    payload = tokenService.verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, 'Refresh token invalide ou expiré');
  }

  const user = await User.findById(payload.sub).select('+refreshTokenHash');
  // Le jeton doit correspondre à celui stocké : un jeton déjà utilisé
  // ou révoqué (logout) est refusé.
  if (!user || user.refreshTokenHash !== tokenService.hashToken(refreshToken)) {
    throw new ApiError(401, 'Refresh token révoqué');
  }

  const tokens = await issueTokens(user);
  res.json({ success: true, data: tokens });
});

/**
 * POST /api/auth/logout   (protégée)
 * Révoque le refresh token courant.
 */
exports.logout = asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req.user.id }, { $unset: { refreshTokenHash: 1 } });
  res.json({ success: true, message: 'Déconnexion réussie' });
});

/**
 * GET /api/auth/me   (protégée)
 * Renvoie le profil de l'utilisateur connecté (attaché par `authenticate`).
 */
exports.me = (req, res) => {
  res.json({ success: true, data: req.user });
};
