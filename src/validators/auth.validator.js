/**
 * Règles de validation pour les routes d'authentification.
 * Chaque tableau est utilisé comme middleware avant `validate`.
 */
const { body } = require('express-validator');

const registerRules = [
  body('name').trim().notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/\d/)
    .withMessage('Le mot de passe doit contenir au moins un chiffre'),
];

const loginRules = [
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('password').notEmpty().withMessage('Le mot de passe est requis'),
];

const refreshRules = [
  body('refreshToken').notEmpty().withMessage('Le refresh token est requis'),
];

module.exports = { registerRules, loginRules, refreshRules };
