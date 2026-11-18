# Express JWT API — Boilerplate

Structure de projet **Express.js** prête pour la production, avec **authentification JWT** (access + refresh token), **middlewares de vérification**, **contrôleurs modulaires** et **connexion MongoDB** (Mongoose). Chaque fichier est commenté pour servir de référence pédagogique.

## Fonctionnalités

- Inscription, connexion, déconnexion, profil (`/me`)
- JWT à double jeton : access token court + refresh token long avec **rotation** et **révocation**
- Middlewares : `authenticate`, `authorize(...roles)`, `isSelfOrAdmin`, validation, gestion d'erreurs
- Mots de passe hachés avec **bcrypt**, refresh tokens stockés **hachés** (SHA-256)
- Sécurité : Helmet, CORS, limitation de débit (anti brute-force), taille de body limitée
- Validation des entrées avec **express-validator**
- Gestion centralisée des erreurs (Mongoose, doublons, 404, 500)
- Documentation **Swagger / OpenAPI 3** interactive sur `/api/docs`
- **Docker** : Dockerfile multi-étapes + `docker-compose` avec MongoDB
- Tests d'intégration **Jest + Supertest + MongoDB en mémoire** (aucune base requise)

## Arborescence

```
express-jwt-api/
├── src/
│   ├── config/
│   │   ├── index.js              # Lecture et validation des variables d'environnement
│   │   ├── database.js           # Connexion / déconnexion MongoDB
│   │   └── swagger.js            # Montage de Swagger UI
│   ├── models/
│   │   └── User.js               # Schéma utilisateur + hachage du mot de passe
│   ├── controllers/
│   │   ├── auth.controller.js    # register, login, refresh, logout, me
│   │   └── user.controller.js    # CRUD utilisateurs
│   ├── middlewares/
│   │   ├── auth.middleware.js    # authenticate, authorize, isSelfOrAdmin
│   │   ├── validate.middleware.js# Renvoie 422 si la validation échoue
│   │   └── error.middleware.js   # 404 + gestionnaire d'erreurs global
│   ├── routes/
│   │   ├── index.js              # Routeur principal /api
│   │   ├── auth.routes.js        # /api/auth/*
│   │   └── user.routes.js        # /api/users/*
│   ├── services/
│   │   └── token.service.js      # Génération / vérification des JWT
│   ├── utils/
│   │   ├── ApiError.js           # Erreur HTTP personnalisée
│   │   └── asyncHandler.js       # Capture des erreurs async
│   ├── validators/
│   │   ├── auth.validator.js
│   │   └── user.validator.js
│   ├── app.js                    # Configuration Express (testable)
│   └── server.js                 # Point d'entrée : DB + écoute HTTP
├── docs/
│   └── openapi.yaml              # Spécification OpenAPI 3 (Swagger)
├── tests/
│   ├── auth.test.js
│   └── docs.test.js
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env.example
├── .gitignore
├── LICENSE
└── package.json
```

## Installation

Prérequis : Node.js ≥ 18 et MongoDB (local, Docker ou Atlas).

```bash
git clone https://github.com/<votre-utilisateur>/express-jwt-api.git
cd express-jwt-api
npm install
cp .env.example .env      # puis modifiez les secrets
npm run dev               # démarrage avec rechargement automatique
```

Lancer MongoDB rapidement avec Docker :

```bash
docker run -d --name mongo -p 27017:27017 mongo:7
```

Générer des secrets JWT robustes :

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Lancer avec Docker

Prérequis : Docker et Docker Compose.

```bash
cp .env.example .env          # renseignez JWT_ACCESS_SECRET et JWT_REFRESH_SECRET
docker compose up -d --build  # construit l'API et démarre MongoDB
docker compose logs -f api    # suivre les journaux
docker compose down           # arrêter (ajoutez -v pour effacer les données)
```

- L'API est disponible sur http://localhost:3000 et MongoDB sur `localhost:27017`.
- Dans le conteneur, l'API se connecte à `mongodb://mongo:27017` (nom du service), la valeur `MONGO_URI` de `.env` est donc ignorée.
- Les données MongoDB sont conservées dans le volume `mongo-data`.
- L'API attend que MongoDB soit prêt (healthcheck) avant de démarrer.

## Documentation Swagger

Une fois le serveur lancé :

- Interface interactive : http://localhost:3000/api/docs
- Spécification JSON : http://localhost:3000/api/docs.json (importable dans Postman ou Insomnia)

Pour tester une route protégée : appelez `POST /auth/login`, copiez l'`accessToken`, cliquez sur **Authorize** et collez le jeton.

La spécification se trouve dans `docs/openapi.yaml` : pensez à la mettre à jour quand vous ajoutez une route.

## Scripts

| Commande      | Description                                  |
|---------------|----------------------------------------------|
| `npm run dev` | Démarre avec nodemon (développement)         |
| `npm start`   | Démarre en mode production                   |
| `npm test`    | Lance les tests (MongoDB en mémoire)         |

## Endpoints

| Méthode | Route                 | Accès                 | Description                        |
|---------|-----------------------|-----------------------|------------------------------------|
| GET     | `/api/health`         | Public                | État du serveur                    |
| POST    | `/api/auth/register`  | Public                | Créer un compte                    |
| POST    | `/api/auth/login`     | Public                | Se connecter                       |
| POST    | `/api/auth/refresh`   | Public (refresh token)| Renouveler les jetons              |
| POST    | `/api/auth/logout`    | Authentifié           | Révoquer le refresh token          |
| GET     | `/api/auth/me`        | Authentifié           | Profil courant                     |
| GET     | `/api/users`          | Admin                 | Liste paginée (`?page=&limit=`)    |
| GET     | `/api/users/:id`      | Admin ou propriétaire | Détail d'un utilisateur            |
| PATCH   | `/api/users/:id`      | Admin ou propriétaire | Modifier (rôle : admin seulement)  |
| DELETE  | `/api/users/:id`      | Admin                 | Supprimer                          |

## Exemples (curl)

```bash
# Inscription
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"motdepasse1"}'

# Connexion -> récupère accessToken et refreshToken
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"motdepasse1"}'

# Route protégée
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <accessToken>"

# Renouvellement des jetons
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'
```

Format de réponse homogène :

```json
{ "success": true, "data": { ... } }
{ "success": false, "message": "Données invalides", "details": [ { "field": "email", "message": "Email invalide" } ] }
```

## Fonctionnement de l'authentification

```
Client                                   API
  │  POST /auth/login (email, mdp)        │
  │ ─────────────────────────────────────▶│  vérifie bcrypt
  │ ◀──────── accessToken + refreshToken ─│  stocke hash(refreshToken)
  │                                       │
  │  GET /auth/me  Bearer accessToken     │
  │ ─────────────────────────────────────▶│  authenticate → req.user
  │                                       │
  │  (access expiré) POST /auth/refresh   │
  │ ─────────────────────────────────────▶│  compare au hash stocké,
  │ ◀──────── nouvelle paire de jetons ───│  rotation : l'ancien est invalidé
```

- **Access token** : durée courte (15 min par défaut), contient `sub` (id) et `role`.
- **Refresh token** : durée longue (7 jours), signé avec un secret distinct, stocké haché en base. Chaque utilisation le remplace ; un jeton réutilisé ou révoqué par `logout` est refusé.

## Ajouter un nouveau module

1. Créer le modèle : `src/models/Product.js`
2. Créer le contrôleur : `src/controllers/product.controller.js`
3. Créer les règles : `src/validators/product.validator.js`
4. Créer les routes : `src/routes/product.routes.js`
5. Les brancher dans `src/routes/index.js` (et documenter la route dans `docs/openapi.yaml`) :

```js
router.use('/products', require('./product.routes'));
```

Exemple de route protégée par rôle :

```js
router.post('/', authenticate, authorize('admin'), productRules, validate, products.create);
```

## Promouvoir un utilisateur admin

Par sécurité, l'inscription crée toujours un rôle `user`. Pour créer le premier admin :

```bash
mongosh express_jwt_api --eval 'db.users.updateOne({email:"alice@example.com"},{$set:{role:"admin"}})'
```

## Licence

MIT
