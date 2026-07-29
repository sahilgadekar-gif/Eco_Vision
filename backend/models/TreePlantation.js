const mongoose = require('mongoose');

const TreePlantationSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },
    // ── Image ───────────────────────────────────────────────────────────────
    imageUrl:  { type: String, required: true }, // relative path served by Express
    imageName: { type: String },

    // ── Tree details ────────────────────────────────────────────────────────
    treeCount: {
      type:    Number,
      required: true,
      min:     1,
      default: 1,
    },
    species: {
      type:    String,
      trim:    true,
      default: '',
    },

    // ── Location ────────────────────────────────────────────────────────────
    location: {
      type:  String,
      trim:  true,
      default: '',
    },

    // ── Notes ────────────────────────────────────────────────────────────
    notes: {
      type:     String,
      trim:     true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default:  '',
    },

    // ── CO2 offset (kg/year) — computed on save ──────────────────────────
    // Average: 1 mature tree absorbs ~21 kg CO2/year
    co2OffsetKg: {
      type:    Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-compute CO2 offset before saving
TreePlantationSchema.pre('save', function (next) {
  this.co2OffsetKg = parseFloat((this.treeCount * 21).toFixed(2));
  next();
});

TreePlantationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('TreePlantation', TreePlantationSchema);
