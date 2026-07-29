const mongoose = require('mongoose');
const path     = require('path');
const fs       = require('fs');
const TreePlantation = require('../models/TreePlantation');

const isDBConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// ── File storage fallback ──────────────────────────────────────────────────
const DATA_DIR  = path.join(__dirname, '..', 'data');
const FILE_PATH = path.join(DATA_DIR, 'trees.json');

const loadFileTrees = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, JSON.stringify([]));
    return JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
  } catch {
    return [];
  }
};

const saveFileTrees = (trees) => {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(FILE_PATH, JSON.stringify(trees, null, 2));
  } catch (err) {
    console.error('Error saving trees to file:', err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all tree plantations for logged-in user
// @route   GET /api/trees
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    let trees = [];

    if (isDBConnected()) {
      const dbTrees = await TreePlantation.find({ user: userId }).sort({ createdAt: -1 }).lean();
      trees = dbTrees.map((t) => ({ ...t, id: t._id.toString() }));
    } else {
      const all = loadFileTrees();
      trees = all.filter((t) => (t.user || '').toString() === userId);
    }

    const withUrls = trees.map((t) => ({
      ...t,
      imageUrl: t.imageUrl.startsWith('http')
        ? t.imageUrl
        : `${process.env.BACKEND_URL || 'http://localhost:5000'}${t.imageUrl}`,
    }));

    const totalTrees     = trees.reduce((s, t) => s + (Number(t.treeCount) || 1), 0);
    const totalCo2Offset = parseFloat(trees.reduce((s, t) => s + (Number(t.co2OffsetKg) || 0), 0).toFixed(2));

    res.status(200).json({
      success: true,
      data:    withUrls,
      stats:   { totalTrees, totalCo2Offset, totalEntries: trees.length },
    });
  } catch (error) {
    console.error('getAll trees error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching plantations.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new tree plantation entry
// @route   POST /api/trees
// @access  Private (multipart/form-data)
// ─────────────────────────────────────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image of the tree plantation.',
      });
    }

    const userId    = (req.user._id || req.user.id).toString();
    const treeCount = parseInt(req.body.treeCount) || 1;
    const species   = req.body.species || '';
    const location  = req.body.location || '';
    const notes     = req.body.notes || '';
    const imageUrl  = `/uploads/trees/${req.file.filename}`;
    const imageName = req.file.originalname;
    const co2Offset = parseFloat((treeCount * 21).toFixed(2));

    let created;

    if (isDBConnected()) {
      const doc = await TreePlantation.create({
        user: userId, imageUrl, imageName, treeCount, species, location, notes,
      });
      created = { ...doc.toObject(), id: doc._id.toString() };
    } else {
      created = {
        id:          Date.now().toString(),
        _id:         Date.now().toString(),
        user:        userId,
        imageUrl,
        imageName,
        treeCount,
        species,
        location,
        notes,
        co2OffsetKg: co2Offset,
        createdAt:   new Date().toISOString(),
      };
      const all = loadFileTrees();
      all.unshift(created);
      saveFileTrees(all);
    }

    res.status(201).json({
      success: true,
      data: {
        ...created,
        imageUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}${imageUrl}`,
      },
    });
  } catch (error) {
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    console.error('create tree error:', error);
    res.status(500).json({ success: false, message: 'Server error saving plantation.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update a tree plantation entry
// @route   PUT /api/trees/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const id     = req.params.id;

    if (isDBConnected()) {
      const plantation = await TreePlantation.findOne({ _id: id, user: userId });
      if (!plantation) return res.status(404).json({ success: false, message: 'Plantation not found.' });

      plantation.treeCount = parseInt(req.body.treeCount) || plantation.treeCount;
      plantation.species   = req.body.species  ?? plantation.species;
      plantation.location  = req.body.location ?? plantation.location;
      plantation.notes     = req.body.notes    ?? plantation.notes;
      await plantation.save();

      return res.status(200).json({
        success: true,
        data: {
          ...plantation.toObject(),
          id: plantation._id.toString(),
          imageUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}${plantation.imageUrl}`,
        },
      });
    } else {
      const all = loadFileTrees();
      const idx = all.findIndex((t) => (t.id === id || t._id === id) && t.user === userId);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Plantation not found.' });

      const updated = {
        ...all[idx],
        treeCount:   parseInt(req.body.treeCount) || all[idx].treeCount,
        species:     req.body.species  ?? all[idx].species,
        location:    req.body.location ?? all[idx].location,
        notes:       req.body.notes    ?? all[idx].notes,
        co2OffsetKg: (parseInt(req.body.treeCount) || all[idx].treeCount) * 21,
      };
      all[idx] = updated;
      saveFileTrees(all);

      return res.status(200).json({
        success: true,
        data: {
          ...updated,
          imageUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}${updated.imageUrl}`,
        },
      });
    }
  } catch (error) {
    console.error('update tree error:', error);
    res.status(500).json({ success: false, message: 'Server error updating plantation.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a tree plantation entry
// @route   DELETE /api/trees/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteOne = async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const id     = req.params.id;

    if (isDBConnected()) {
      const plantation = await TreePlantation.findOne({ _id: id, user: userId });
      if (!plantation) return res.status(404).json({ success: false, message: 'Plantation not found.' });

      const filePath = path.join(__dirname, '..', plantation.imageUrl);
      fs.unlink(filePath, () => {});
      await plantation.deleteOne();
    } else {
      let all = loadFileTrees();
      const item = all.find((t) => (t.id === id || t._id === id) && t.user === userId);
      if (!item) return res.status(404).json({ success: false, message: 'Plantation not found.' });

      const filePath = path.join(__dirname, '..', item.imageUrl);
      fs.unlink(filePath, () => {});

      all = all.filter((t) => !( (t.id === id || t._id === id) && t.user === userId ));
      saveFileTrees(all);
    }

    res.status(200).json({ success: true, message: 'Plantation deleted.' });
  } catch (error) {
    console.error('delete tree error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting plantation.' });
  }
};
