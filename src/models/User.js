/**
 * Modèle Utilisateur (Mongoose).
 * ------------------------------------------------------------
 * - Le mot de passe est haché automatiquement avant chaque sauvegarde.
 * - `select: false` empêche le hash d'être renvoyé par défaut dans les requêtes.
 * - `toJSON` nettoie l'objet avant envoi au client.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['user', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true, // index unique : deux comptes ne peuvent partager un email
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ROLES, default: 'user' },
    // Stocke le hash du refresh token courant pour pouvoir le révoquer (logout).
    refreshTokenHash: { type: String, select: false },
  },
  { timestamps: true } // ajoute createdAt / updatedAt
);

/**
 * Hook "pre save" : hache le mot de passe uniquement s'il a été modifié.
 * Sans ce test, on re-hacherait le hash à chaque mise à jour du profil.
 */
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12); // 12 tours : bon compromis sécurité/perf
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/** Compare un mot de passe en clair avec le hash stocké. */
userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

/** Retire les champs sensibles lors de la sérialisation JSON. */
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    delete ret.refreshTokenHash;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);
module.exports = { User, ROLES };
