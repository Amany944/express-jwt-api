/** Règles de validation pour les routes utilisateurs. */
const { body, param } = require('express-validator');
const { ROLES } = require('../models/User');

const idRule = [param('id').isMongoId().withMessage('Identifiant invalide')];

const updateUserRules = [
  ...idRule,
  body('name').optional().trim().notEmpty().withMessage('Le nom ne peut pas être vide'),
  body('email').optional().isEmail().withMessage('Email invalide').normalizeEmail(),
  // Le rôle n'est modifiable que par un admin (vérifié dans le contrôleur)
  body('role').optional().isIn(ROLES).withMessage(`Rôle autorisé : ${ROLES.join(', ')}`),
];

module.exports = { idRule, updateUserRules };
