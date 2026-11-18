/**
 * Enveloppe un contrôleur async pour transmettre les erreurs à `next()`.
 * ------------------------------------------------------------
 * Express 4 ne capture pas les promesses rejetées : sans ce wrapper,
 * une exception dans un `async (req, res)` ferait planter la requête.
 *
 * Usage : router.get('/', asyncHandler(async (req, res) => { ... }));
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
