const mongoose    = require('mongoose');
const path        = require('path');
const fs          = require('fs');
const Calculation = require('../models/Calculation');

const isDBConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// ── File storage fallback ──────────────────────────────────────────────────
const DATA_DIR  = path.join(__dirname, '..', 'data');
const FILE_PATH = path.join(DATA_DIR, 'calculations.json');

const loadFileCalcs = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, JSON.stringify([]));
    return JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
  } catch {
    return [];
  }
};

const saveFileCalcs = (calcs) => {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(FILE_PATH, JSON.stringify(calcs, null, 2));
  } catch (err) {
    console.error('Error saving calculations to file:', err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all calculations for the logged-in user
// @route   GET /api/calculations
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.getCalculations = async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    let calculations = [];

    if (isDBConnected()) {
      const dbCalcs = await Calculation.find({ user: userId }).sort({ createdAt: -1 }).lean();
      calculations = dbCalcs.map((c) => ({
        ...c,
        id:   c._id.toString(),
        date: c.createdAt,
      }));
    } else {
      const all = loadFileCalcs();
      calculations = all.filter((c) => (c.user || '').toString() === userId);
    }

    res.status(200).json({ success: true, data: calculations });
  } catch (error) {
    console.error('getCalculations error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching calculations.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Save a new calculation
// @route   POST /api/calculations
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.saveCalculation = async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const {
      transportation, energy, food, lifestyle,
      totalKg, totalTonnes, ecoScore, category,
      categoryColor, categoryEmoji, vsAverage, treesNeeded, inputs,
    } = req.body;

    let created;

    if (isDBConnected()) {
      const doc = await Calculation.create({
        user: userId, transportation, energy, food, lifestyle,
        totalKg, totalTonnes, ecoScore, category, categoryColor, categoryEmoji, vsAverage, treesNeeded, inputs: inputs || {},
      });
      created = { ...doc.toObject(), id: doc._id.toString(), date: doc.createdAt };
    } else {
      created = {
        id:            Date.now().toString(),
        _id:           Date.now().toString(),
        user:          userId,
        transportation, energy, food, lifestyle,
        totalKg, totalTonnes, ecoScore, category, categoryColor, categoryEmoji, vsAverage, treesNeeded, inputs: inputs || {},
        createdAt:     new Date().toISOString(),
        date:          new Date().toISOString(),
      };
      const all = loadFileCalcs();
      all.unshift(created);
      saveFileCalcs(all);
    }

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('saveCalculation error:', error);
    res.status(500).json({ success: false, message: 'Server error saving calculation.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete one calculation by ID
// @route   DELETE /api/calculations/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteCalculation = async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const id     = req.params.id;

    if (isDBConnected()) {
      const calculation = await Calculation.findOne({ _id: id, user: userId });
      if (!calculation) return res.status(404).json({ success: false, message: 'Calculation not found.' });
      await calculation.deleteOne();
    } else {
      let all = loadFileCalcs();
      all = all.filter((c) => !( (c.id === id || c._id === id) && (c.user || '').toString() === userId ));
      saveFileCalcs(all);
    }

    res.status(200).json({ success: true, message: 'Calculation deleted.' });
  } catch (error) {
    console.error('deleteCalculation error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting calculation.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete ALL calculations for the logged-in user
// @route   DELETE /api/calculations
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.clearCalculations = async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();

    if (isDBConnected()) {
      const result = await Calculation.deleteMany({ user: userId });
      return res.status(200).json({ success: true, message: `Cleared ${result.deletedCount} calculation(s).` });
    } else {
      let all = loadFileCalcs();
      all = all.filter((c) => (c.user || '').toString() !== userId);
      saveFileCalcs(all);
      return res.status(200).json({ success: true, message: 'Calculations cleared.' });
    }
  } catch (error) {
    console.error('clearCalculations error:', error);
    res.status(500).json({ success: false, message: 'Server error clearing calculations.' });
  }
};
