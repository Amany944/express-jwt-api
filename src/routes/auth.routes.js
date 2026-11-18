/**
 * Routes d'authentification : /api/auth/*
 * Ordre de la chaîne : [règles] -> validate -> [authenticate] -> contrôleur
 */
const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const auth = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { registerRules, loginRules, refreshRules } = require('../validators/auth.validator');

// Limite les tentatives sur les routes sensibles (anti brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Trop de tentatives, réessayez plus tard' },
  skip: () => process.env.NODE_ENV === 'test',
});

router.post('/register', authLimiter, registerRules, validate, auth.register);
router.post('/login', authLimiter, loginRules, validate, auth.login);
router.post('/refresh', refreshRules, validate, auth.refresh);
router.post('/logout', authenticate, auth.logout);
router.get('/me', authenticate, auth.me);

module.exports = router;
