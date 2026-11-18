/**
 * Routes utilisateurs : /api/users/*
 * `router.use(authenticate)` protège TOUTES les routes de ce fichier.
 */
const router = require('express').Router();
const users = require('../controllers/user.controller');
const validate = require('../middlewares/validate.middleware');
const { authenticate, authorize, isSelfOrAdmin } = require('../middlewares/auth.middleware');
const { idRule, updateUserRules } = require('../validators/user.validator');

router.use(authenticate);

router.get('/', authorize('admin'), users.list);
router.get('/:id', idRule, validate, isSelfOrAdmin, users.getById);
router.patch('/:id', updateUserRules, validate, isSelfOrAdmin, users.update);
router.delete('/:id', idRule, validate, authorize('admin'), users.remove);

module.exports = router;
