const express = require('express');
const { body } = require('express-validator');
const router  = express.Router();

const {
  getCalculations,
  saveCalculation,
  deleteCalculation,
  clearCalculations,
} = require('../controllers/calculationController');
const { protect } = require('../middleware/auth');
const validate    = require('../middleware/validate');

// ── Validation ────────────────────────────────────────────────────────────────
const calcRules = [
  body('totalKg').isNumeric().withMessage('totalKg must be a number'),
  body('totalTonnes').isNumeric().withMessage('totalTonnes must be a number'),
  body('ecoScore')
    .isInt({ min: 0, max: 100 }).withMessage('ecoScore must be between 0 and 100'),
  body('category').notEmpty().withMessage('category is required'),
];

// ── Routes ────────────────────────────────────────────────────────────────────
// All routes require authentication
router.use(protect);

router.get('/',      getCalculations);
router.post('/',     calcRules, validate, saveCalculation);
router.delete('/',   clearCalculations);         // clear all
router.delete('/:id', deleteCalculation);        // delete one

module.exports = router;
