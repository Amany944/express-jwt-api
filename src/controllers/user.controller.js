/**
 * Contrôleur de gestion des utilisateurs (CRUD).
 * Les droits d'accès sont gérés en amont par les middlewares de route.
 */
const { User } = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/users?page=1&limit=10   (admin)
 * Liste paginée des utilisateurs.
 */
exports.list = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);

  const [items, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(),
  ]);

  res.json({
    success: true,
    data: items,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

/** GET /api/users/:id   (admin ou propriétaire) */
exports.getById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'Utilisateur introuvable');
  res.json({ success: true, data: user });
});

/** PATCH /api/users/:id   (admin ou propriétaire) */
exports.update = asyncHandler(async (req, res) => {
  const allowed = ['name', 'email'];
  // Seul un admin peut changer un rôle
  if (req.user.role === 'admin') allowed.push('role');

  // Liste blanche des champs modifiables (évite l'injection de champs)
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowed.includes(key))
  );

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true, // renvoie le document mis à jour
    runValidators: true,
  });
  if (!user) throw new ApiError(404, 'Utilisateur introuvable');
  res.json({ success: true, data: user });
});

/** DELETE /api/users/:id   (admin) */
exports.remove = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'Utilisateur introuvable');
  res.status(204).send();
});
