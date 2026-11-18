/**
 * Erreur HTTP personnalisée.
 * ------------------------------------------------------------
 * Permet de lever une erreur avec un code HTTP depuis n'importe où :
 *   throw new ApiError(404, 'Utilisateur introuvable');
 * Le middleware d'erreurs global la transforme en réponse JSON.
 */
class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // erreur "prévue" (vs bug inattendu)
  }
}

module.exports = ApiError;
