/**
 * Documentation interactive Swagger UI.
 * ------------------------------------------------------------
 * La spécification OpenAPI est écrite à la main dans docs/openapi.yaml
 * (un seul fichier à maintenir quand on ajoute une route).
 *
 *  - Interface :  GET /api/docs
 *  - JSON brut :  GET /api/docs.json  (import Postman, génération de clients)
 */
const fs = require('fs');
const path = require('path');
const YAML = require('yaml');
const swaggerUi = require('swagger-ui-express');

const spec = YAML.parse(fs.readFileSync(path.join(__dirname, '../../docs/openapi.yaml'), 'utf8'));

function setupSwagger(app) {
  app.get('/api/docs.json', (_req, res) => res.json(spec));
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(spec, {
      customSiteTitle: 'Express JWT API — Documentation',
      swaggerOptions: { persistAuthorization: true }, // garde le jeton après rechargement
    })
  );
}

module.exports = { setupSwagger, spec };
