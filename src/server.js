/**
 * Point d'entrée : connexion à la base puis démarrage du serveur HTTP.
 * Gère aussi l'arrêt propre (Ctrl+C, signal Docker/Kubernetes).
 */
const app = require('./app');
const config = require('./config');
const { connectDB, disconnectDB } = require('./config/database');

async function start() {
  try {
    await connectDB(config.mongoUri);
    const server = app.listen(config.port, () => {
      console.log(`[API] Serveur démarré sur http://localhost:${config.port} (${config.env})`);
    });

    // Arrêt propre : on cesse d'accepter des requêtes puis on ferme la base
    const shutdown = (signal) => {
      console.log(`[API] ${signal} reçu, arrêt en cours...`);
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('[API] Échec du démarrage :', err.message);
    process.exit(1);
  }
}

start();
