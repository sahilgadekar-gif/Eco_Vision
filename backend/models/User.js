const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type:     String,
      required: [true, 'Email is required'],
      unique:   true,
      lowercase: true,
      trim:     true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select:    false, // Never returned in queries by default
    },
    bio: {
      type:     String,
      trim:     true,
      maxlength: [300, 'Bio cannot exceed 300 characters'],
      default:  '',
    },
    avatar: {
      type:    String,
      default: '',
    },
    settings: {
      theme:       { type: String, enum: ['dark', 'light'], default: 'dark' },
      unit:        { type: String, enum: ['kg', 'tonnes'],  default: 'kg'   },
      emailAlerts: { type: Boolean, default: true  },
      weeklyReport:{ type: Boolean, default: false },
      achievements:{ type: Boolean, default: true  },
      density:     { type: String,  default: 'comfortable' },
      dateFormat:  { type: String,  default: 'MM/DD/YYYY'  },
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

// ── Pre-save hook: hash password before saving ─────────────────────────────
UserSchema.pre('save', async function (next) {
  // Only hash if password field was modified
  if (!this.isModified('password')) return next();

  const salt    = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare plain password with hashed ───────────────────
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── Virtual: avatar initial (first letter of name) ────────────────────────
UserSchema.virtual('avatarInitial').get(function () {
  return this.name ? this.name.charAt(0).toUpperCase() : 'U';
});

module.exports = mongoose.model('User', UserSchema);
