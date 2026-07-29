const mongoose    = require('mongoose');
const bcrypt      = require('bcryptjs');
const path        = require('path');
const fs          = require('fs');
const User        = require('../models/User');
const Calculation = require('../models/Calculation');

const isDBConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

const DATA_DIR  = path.join(__dirname, '..', 'data');
const FILE_PATH = path.join(DATA_DIR, 'users.json');

const loadFileUsers = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, JSON.stringify([]));
    return JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
  } catch {
    return [];
  }
};

const saveFileUsers = (users) => {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(FILE_PATH, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error saving users to file:', err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update user profile (name, bio)
// @route   PUT /api/users/profile
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { name, bio } = req.body;

    if (isDBConnected()) {
      const user = await User.findByIdAndUpdate(
        userId,
        { name, bio: bio || '' },
        { new: true, runValidators: true }
      );
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        user: {
          _id:       user._id.toString(),
          name:      user.name,
          email:     user.email,
          bio:       user.bio,
          avatar:    user.name.charAt(0).toUpperCase(),
          settings:  user.settings,
          createdAt: user.createdAt,
        },
      });
    } else {
      const users = loadFileUsers();
      const idx = users.findIndex((u) => u._id === userId || u.id === userId);
      if (idx !== -1) {
        users[idx].name = name || users[idx].name;
        users[idx].bio  = bio  ?? users[idx].bio;
        users[idx].avatar = (name || users[idx].name).charAt(0).toUpperCase();
        saveFileUsers(users);

        res.status(200).json({
          success: true,
          message: 'Profile updated successfully.',
          user: users[idx],
        });
      } else {
        res.status(200).json({
          success: true,
          message: 'Profile updated.',
          user: { _id: userId, name, bio: bio || '', avatar: name.charAt(0).toUpperCase() },
        });
      }
    }
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { currentPassword, newPassword } = req.body;

    if (isDBConnected()) {
      const user = await User.findById(userId).select('+password');
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
      }

      user.password = newPassword;
      await user.save();
      return res.status(200).json({ success: true, message: 'Password changed successfully.' });
    } else {
      const users = loadFileUsers();
      const idx = users.findIndex((u) => u._id === userId || u.id === userId);
      if (idx !== -1) {
        const isMatch = await bcrypt.compare(currentPassword, users[idx].password);
        if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
        }
        const salt = await bcrypt.genSalt(10);
        users[idx].password = await bcrypt.hash(newPassword, salt);
        saveFileUsers(users);
      }
      return res.status(200).json({ success: true, message: 'Password changed successfully.' });
    }
  } catch (error) {
    console.error('changePassword error:', error);
    res.status(500).json({ success: false, message: 'Server error changing password.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete account (user + all calculations)
// @route   DELETE /api/users
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteAccount = async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();

    if (isDBConnected()) {
      await Calculation.deleteMany({ user: userId });
      await User.findByIdAndDelete(userId);
    } else {
      let users = loadFileUsers();
      users = users.filter((u) => u._id !== userId && u.id !== userId);
      saveFileUsers(users);
    }

    res.status(200).json({ success: true, message: 'Account deleted successfully.' });
  } catch (error) {
    console.error('deleteAccount error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting account.' });
  }
};
