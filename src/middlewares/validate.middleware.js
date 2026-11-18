/**
 * Middleware de validation des entrées (express-validator).
 * ------------------------------------------------------------
 * Se place APRÈS les règles de validation dans la route :
 *   router.post('/register', registerRules, validate, controller.register);
 * Si une règle échoue, renvoie 422 avec la liste des erreurs.
 */
const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
  next(new ApiError(422, 'Données invalides', details));
};

module.exports = validate;
