const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const fs       = require('fs');
const path     = require('path');
const User     = require('../models/User');
const { generateToken } = require('../middleware/auth');

// ── File-based user store fallback (when MongoDB is offline) ───────────────
const DATA_DIR  = path.join(__dirname, '..', 'data');
const FILE_PATH = path.join(DATA_DIR, 'users.json');

const loadFileUsers = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, JSON.stringify([]));
    const content = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(content);
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

const isDBConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// ── Helper: send token response ────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id || user.id);

  const userData = {
    _id:       user._id || user.id,
    name:      user.name,
    email:     user.email,
    bio:       user.bio || '',
    avatar:    user.name ? user.name.charAt(0).toUpperCase() : 'U',
    settings:  user.settings || { theme: 'dark', unit: 'kg' },
    createdAt: user.createdAt || new Date().toISOString(),
  };

  res.status(statusCode).json({
    success: true,
    token,
    user: userData,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    if (isDBConnected()) {
      // 🟢 MongoDB Mode
      const existing = await User.findOne({ email: lowerEmail });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists.',
        });
      }

      const user = await User.create({ name: name.trim(), email: lowerEmail, password });
      return sendTokenResponse(user, 201, res);
    } else {
      // 🟡 File-based Persistence Fallback Mode (MongoDB daemon offline)
      const users = loadFileUsers();
      const existing = users.find((u) => u.email === lowerEmail);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists.',
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: Date.now().toString(),
        name: name.trim(),
        email: lowerEmail,
        password: hashedPassword,
        bio: '',
        avatar: name.trim().charAt(0).toUpperCase(),
        settings: { theme: 'dark', unit: 'kg' },
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      saveFileUsers(users);

      return sendTokenResponse(newUser, 201, res);
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    if (isDBConnected()) {
      // 🟢 MongoDB Mode
      const user = await User.findOne({ email: lowerEmail }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No account found with this email.',
        });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password.',
        });
      }

      return sendTokenResponse(user, 200, res);
    } else {
      // 🟡 File-based Persistence Fallback Mode
      const users = loadFileUsers();
      const user = users.find((u) => u.email === lowerEmail);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No account found with this email.',
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password.',
        });
      }

      return sendTokenResponse(user, 200, res);
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get current logged-in user (validate token)
// @route   GET /api/auth/me
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      user: {
        _id:       user._id || user.id,
        name:      user.name,
        email:     user.email,
        bio:       user.bio || '',
        avatar:    user.name ? user.name.charAt(0).toUpperCase() : 'U',
        settings:  user.settings || { theme: 'dark', unit: 'kg' },
        createdAt: user.createdAt || new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};
