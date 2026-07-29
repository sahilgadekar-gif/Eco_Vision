const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const { updateProfile, changePassword, deleteAccount } = require('../controllers/userController');
const { protect }  = require('../middleware/auth');
const validate     = require('../middleware/validate');

// ── Validation ────────────────────────────────────────────────────────────────
const profileRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 80 }).withMessage('Name cannot exceed 80 characters'),
  body('bio')
    .optional()
    .isLength({ max: 300 }).withMessage('Bio cannot exceed 300 characters'),
];

const passwordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];

// ── Routes ────────────────────────────────────────────────────────────────────
// All routes require authentication
router.use(protect);

router.put('/profile',  profileRules,  validate, updateProfile);
router.put('/password', passwordRules, validate, changePassword);
router.delete('/',      deleteAccount);

module.exports = router;
