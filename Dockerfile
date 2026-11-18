# ------------------------------------------------------------
# Image de production de l'API (build multi-étapes)
# ------------------------------------------------------------

# Étape 1 : installation des dépendances de production uniquement
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# npm ci : installation reproductible à partir du package-lock.json
RUN npm ci --omit=dev && npm cache clean --force

# Étape 2 : image finale, légère
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copie des dépendances installées puis du code source
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
COPY docs ./docs

# Sécurité : ne pas exécuter le processus en root
# (l'utilisateur "node" est fourni par l'image officielle)
USER node

EXPOSE 3000

# Vérification de santé utilisée par Docker / docker compose
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-3000}/api/health || exit 1

CMD ["node", "src/server.js"]
