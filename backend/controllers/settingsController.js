const mongoose = require('mongoose');
const User     = require('../models/User');

const isDBConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.getSettings = async (req, res) => {
  try {
    const defaultSettings = {
      theme: 'dark', unit: 'kg', emailAlerts: true,
      weeklyReport: false, achievements: true, density: 'comfortable', dateFormat: 'MM/DD/YYYY',
    };

    res.status(200).json({
      success: true,
      settings: req.user.settings || defaultSettings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching settings.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.updateSettings = async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const allowedFields = [
      'theme', 'unit', 'emailAlerts',
      'weeklyReport', 'achievements', 'density', 'dateFormat',
    ];

    const updatedSettings = { ...(req.user.settings || {}) };
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updatedSettings[field] = req.body[field];
      }
    });

    if (isDBConnected()) {
      const settingsUpdate = {};
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          settingsUpdate[`settings.${field}`] = req.body[field];
        }
      });

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: settingsUpdate },
        { new: true, runValidators: false }
      );

      return res.status(200).json({
        success:  true,
        message:  'Settings updated.',
        settings: user ? user.settings : updatedSettings,
      });
    } else {
      return res.status(200).json({
        success:  true,
        message:  'Settings updated.',
        settings: updatedSettings,
      });
    }
  } catch (error) {
    console.error('updateSettings error:', error);
    res.status(500).json({ success: false, message: 'Server error updating settings.' });
  }
};
