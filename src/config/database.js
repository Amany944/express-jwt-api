/**
 * Connexion à MongoDB via Mongoose.
 * ------------------------------------------------------------
 * - `connectDB()` est appelée une seule fois au démarrage (server.js).
 * - Les événements de connexion sont journalisés pour faciliter le debug.
 * - `disconnectDB()` sert à l'arrêt propre (SIGINT/SIGTERM) et aux tests.
 */
const mongoose = require('mongoose');

async function connectDB(uri) {
  // strictQuery : ignore les champs de filtre absents du schéma.
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => console.log('[DB] MongoDB connecté'));
  mongoose.connection.on('error', (err) => console.error('[DB] Erreur :', err.message));
  mongoose.connection.on('disconnected', () => console.warn('[DB] MongoDB déconnecté'));

  // serverSelectionTimeoutMS : échoue vite si la base est injoignable.
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  return mongoose.connection;
}

async function disconnectDB() {
  await mongoose.connection.close();
}

module.exports = { connectDB, disconnectDB };
