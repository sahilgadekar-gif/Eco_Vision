const express = require('express');
const { body } = require('express-validator');
const router  = express.Router();

const {
  getAll, create, update, deleteOne,
} = require('../controllers/treePlantationController');
const { protect } = require('../middleware/auth');
const upload      = require('../middleware/upload');
const validate    = require('../middleware/validate');

// ── Validation for metadata fields ───────────────────────────────────────────
const treeRules = [
  body('treeCount')
    .isInt({ min: 1 }).withMessage('Tree count must be at least 1'),
  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
];

// ── All routes require authentication ────────────────────────────────────────
router.use(protect);

router.get('/',     getAll);
router.post('/',    upload.single('image'), treeRules, validate, create);
router.put('/:id',  treeRules, validate, update);
router.delete('/:id', deleteOne);

module.exports = router;
