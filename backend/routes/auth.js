const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const { register, login, getMe, logout } = require('../controllers/authController');
const { protect }  = require('../middleware/auth');
const validate     = require('../middleware/validate');

// ── Validation rules ──────────────────────────────────────────────────────────
const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 80 }).withMessage('Name cannot exceed 80 characters'),
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// ── Routes ────────────────────────────────────────────────────────────────────
router.post('/register', registerRules, validate, register);
router.post('/login',    loginRules,    validate, login);
router.get('/me',        protect, getMe);
router.post('/logout',   protect, logout);

module.exports = router;
