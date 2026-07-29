const mongoose = require('mongoose');

const CalculationSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },
    // ── Category totals (kg CO2) ───────────────────────────────────────────
    transportation: { type: Number, required: true, default: 0 },
    energy:         { type: Number, required: true, default: 0 },
    food:           { type: Number, required: true, default: 0 },
    lifestyle:      { type: Number, required: true, default: 0 },

    // ── Totals ─────────────────────────────────────────────────────────────
    totalKg:      { type: Number, required: true },
    totalTonnes:  { type: Number, required: true },

    // ── Scoring ────────────────────────────────────────────────────────────
    ecoScore:     { type: Number, required: true, min: 0, max: 100 },
    category:     { type: String, required: true },
    categoryColor:{ type: String },
    categoryEmoji:{ type: String },
    vsAverage:    { type: Number },
    treesNeeded:  { type: Number },

    // ── Raw inputs (optional, stored for reference) ────────────────────────
    inputs: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // createdAt = calculation date
  }
);

// Ensure indexes for performance
CalculationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Calculation', CalculationSchema);
