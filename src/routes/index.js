/**
 * Routeur principal : regroupe tous les modules sous /api.
 * Pour ajouter un module (ex. produits) :
 *   1. créer controllers/product.controller.js et routes/product.routes.js
 *   2. ajouter : router.use('/products', require('./product.routes'));
 */
const router = require('express').Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', uptime: process.uptime() });
});

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));

module.exports = router;
