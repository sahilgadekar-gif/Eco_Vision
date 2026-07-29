const jwt      = require('jsonwebtoken');
const mongoose = require('mongoose');
const User     = require('../models/User');

const isDBConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

/**
 * Middleware: Protect routes with JWT verification.
 * Expects: Authorization: Bearer <token>
 * Sets req.user to the authenticated User document or decoded fallback object.
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. No token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (isDBConnected()) {
      req.user = await User.findById(decoded.id).select('-password');
    } else {
      // Fallback mode: create user object from decoded JWT ID
      req.user = {
        _id:       decoded.id,
        id:        decoded.id,
        name:      'User',
        email:     'user@ecovision.local',
        avatar:    'U',
        settings:  { theme: 'dark', unit: 'kg' },
      };
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User associated with this token no longer exists.',
      });
    }

    next();
  } catch (error) {
    const message =
      error.name === 'TokenExpiredError'
        ? 'Token has expired. Please log in again.'
        : 'Invalid token. Please log in again.';

    return res.status(401).json({ success: false, message });
  }
};

/**
 * Helper: Generate and sign a JWT for a given user ID.
 */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

module.exports = { protect, generateToken };
