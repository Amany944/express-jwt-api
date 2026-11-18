/**
 * Configuration de l'application Express (sans démarrer le serveur).
 * ------------------------------------------------------------
 * Séparer `app` de `server` permet de tester l'API avec Supertest
 * sans ouvrir de port réseau.
 */
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();

// --- Middlewares globaux (l'ordre compte) ---
app.use(helmet()); // en-têtes HTTP de sécurité
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '10kb' })); // parse le JSON, limite la taille
app.use(express.urlencoded({ extended: true }));
if (config.env !== 'test') app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));

// --- Routes ---
app.use('/api', routes);

// --- Gestion des erreurs (toujours en dernier) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
